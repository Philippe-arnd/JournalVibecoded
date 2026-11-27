// OpenLens on the server (https://openlens.philapps.com): server errors, route
// stats (per route template and status, never one event per request), runtime
// health and outgoing calls (Resend, Whisper: host only), next to the browser
// SDK's events (client/src/openlens.js).
//
// Config comes from the runtime environment: OPENLENS_HOST and OPENLENS_KEY,
// else VITE_OPENLENS_HOST / VITE_OPENLENS_KEY (the same public capture key as
// the browser). Without them, or under tests, this is a no-op.
//
// Privacy: nothing here reads a request body, header or URL. Entries and audio
// are never sent; route stats keep the route template (`/api/entries/:id`),
// server errors carry the user id the browser SDK identifies with.
import type { Request, RequestHandler, ErrorRequestHandler } from "express";
import { OpenLens } from "./vendor/openlens-node.mjs";

const host = (process.env.OPENLENS_HOST || process.env.VITE_OPENLENS_HOST || "").replace(/\/$/, "");
const key = process.env.OPENLENS_KEY || process.env.VITE_OPENLENS_KEY;
// Same release name as the browser (client/vite.config.js: 7-character commit).
const release = (process.env.SOURCE_COMMIT || "").slice(0, 7) || undefined;

export const lens: OpenLens | null =
    host && key && process.env.NODE_ENV !== "test"
        ? new OpenLens({
              host,
              key,
              release,
              onError: (e) => console.error("[openlens]", e instanceof Error ? e.message : e),
          })
        : null;

// The signed-in user: requireAuth puts the better-auth session on req.session.
const userOf = (req: any): string | undefined => req.session?.user?.id;

/** First middleware: route stats, runtime health, request context. */
export const lensRequests = (): RequestHandler =>
    lens ? lens.express({ user: userOf }) : (_req, _res, next) => next();

/** Error handler, after the routes: reports the error, then hands it on. */
export const lensErrors = (): ErrorRequestHandler =>
    lens ? lens.expressErrors() : (err, _req, _res, next) => next(err);

/** An error a route catches itself (it answers 5xx, so lensErrors never sees it). */
export function lensCapture(err: unknown, req: Request): void {
    if (!lens) return;
    const r = req as any;
    lens.captureException(err, {
        ...(r.openlens || {}),
        distinctId: userOf(r),
        route: r.route?.path ? `${r.baseUrl || ""}${r.route.path}` : undefined,
        method: req.method,
    });
}

if (lens) {
    lens.captureUncaught();
    lens.captureOutgoing();
    // Send the open stats window before the container stops.
    process.once("SIGTERM", () => void lens?.shutdown());
}
