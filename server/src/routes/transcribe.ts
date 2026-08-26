import { Router, raw } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

// The whisper container is only reachable on the internal Docker network — it has
// no auth of its own, so every call must go through this authenticated route.
const WHISPER_URL = process.env.WHISPER_URL || "http://whisper:9000";
const WHISPER_LANGUAGE = process.env.WHISPER_LANGUAGE || "fr";

// Whisper accepts ~99 languages, but the client only offers these. Validating against
// a fixed set keeps arbitrary caller input out of the whisper query string and turns a
// typo into a 400 instead of a silently failed transcription.
const SUPPORTED_LANGUAGES = new Set(["fr", "en", "it", "es", "de"]);
// Whisper detects the language itself when the parameter is omitted. Offered as an
// explicit choice, never as the default: detection reads only the first 30s window and
// gets confused by code-switching, which is common when dictating technical notes.
const AUTO_LANGUAGE = "auto";

// The client caps recordings at 60s (~240KB of 32kbps opus). 5MB leaves room for
// browsers that fall back to a bulkier codec without letting a bypassed client
// queue an arbitrarily long job on a CPU-bound service.
const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
// faster-whisper `small` runs at roughly 3x realtime on this CPU, so 60s of audio
// lands around 20s. Generous headroom, but bounded so a stuck worker can't hold a
// request open forever.
const TRANSCRIPTION_TIMEOUT_MS = 120_000;

// Transcription is CPU-bound and shared by every user of the instance, so one
// caller in a loop can starve the rest. Sliding window, in-memory: this is a
// throttle against accidental hammering, not a security boundary.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_CALLS = 10;
const RATE_LIMIT_MAX_TRACKED_USERS = 1000;
const recentCalls = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
    const now = Date.now();
    // Opportunistic prune so the map can't grow without bound.
    if (recentCalls.size > RATE_LIMIT_MAX_TRACKED_USERS) {
        for (const [key, timestamps] of recentCalls) {
            if (timestamps.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) recentCalls.delete(key);
        }
    }
    const calls = (recentCalls.get(userId) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    calls.push(now);
    recentCalls.set(userId, calls);
    return calls.length > RATE_LIMIT_MAX_CALLS;
}

// Takes the raw recording and hands back text. The audio is never persisted here:
// it goes back to the client, which encrypts it alongside the entry as before.
router.post(
    "/",
    raw({ type: ["audio/*", "application/octet-stream"], limit: MAX_AUDIO_BYTES }),
    async (req: any, res) => {
        if (isRateLimited(req.session.user.id)) {
            return res.status(429).json({ error: "Too many transcription requests" });
        }
        if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
            return res.status(400).json({ error: "Missing audio payload" });
        }

        const requested = typeof req.query.language === "string" ? req.query.language : "";
        if (requested && requested !== AUTO_LANGUAGE && !SUPPORTED_LANGUAGES.has(requested)) {
            return res.status(400).json({ error: "Unsupported language" });
        }
        const language = requested || WHISPER_LANGUAGE;

        try {
            const contentType = req.get("content-type") || "audio/webm";
            const form = new FormData();
            form.append("audio_file", new Blob([req.body], { type: contentType }), "recording.webm");

            const url = `${WHISPER_URL}/asr?task=transcribe&output=json`
                + (language === AUTO_LANGUAGE ? "" : `&language=${encodeURIComponent(language)}`);

            const whisperRes = await fetch(url, {
                method: "POST",
                body: form,
                signal: AbortSignal.timeout(TRANSCRIPTION_TIMEOUT_MS),
            });

            if (!whisperRes.ok) {
                console.error(`Transcription service returned ${whisperRes.status}`);
                return res.status(502).json({ error: "Transcription service unavailable" });
            }

            const payload: any = await whisperRes.json();
            return res.json({ text: String(payload?.text || "").trim() });
        } catch (error: any) {
            const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
            console.error("Transcription failed:", error?.message);
            return timedOut
                ? res.status(504).json({ error: "Transcription timed out" })
                : res.status(502).json({ error: "Transcription service unavailable" });
        }
    }
);

export default router;
