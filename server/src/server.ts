import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import entriesRouter from "./routes/entries";
import transcribeRouter from "./routes/transcribe";
import { createO2Proxy } from "./o2-proxy";
import { lensRequests, lensErrors } from "./openlens";

const app = express();

app.set('trust proxy', true);

// OpenLens route stats and runtime health: first, so every request counts
app.use(lensRequests());

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173"
].filter(Boolean) as string[];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "traceparent", "tracestate", "baggage", "x-openlens-session"]
}));

// OpenObserve RUM relay: must run before express.json (it needs the raw body)
app.use("/api/o2-proxy", createO2Proxy());

// Raised from the Express default (100kb) to fit base64-encoded voice-note
// recordings (up to 4 sections x ~2MB of encrypted audio, see routes/entries.ts).
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", (req, res, next) => {
    // Never log req.body here: it carries plaintext passwords (sign-in, sign-up, reset).
    console.log(`Auth Request: ${req.method} ${req.path}`);
    next();
});

app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

app.all(/^\/api\/auth\/.*/, toNodeHandler(auth));

app.use("/api/entries", entriesRouter);
// Raw audio body, parsed inside the router — express.json above only claims
// application/json, so the recording passes through untouched.
app.use("/api/transcribe", transcribeRouter);

app.all(/.*/, (req, res) => {
    res.status(404).send("Not Found");
});

// OpenLens: errors a route did not catch (after every route)
app.use(lensErrors());

export default app;

if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
