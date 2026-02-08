import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import entriesRouter from "./routes/entries";

const app = express();

app.set('trust proxy', true);

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173"
].filter(Boolean) as string[];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

app.use(express.json());

app.use("/api/auth", (req, res, next) => {
    console.log(`Auth Request: ${req.method} ${req.path}`, req.body);
    next();
});

app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

app.all(/^\/api\/auth\/.*/, toNodeHandler(auth));

app.use("/api/entries", entriesRouter);

app.all(/.*/, (req, res) => {
    res.status(404).send("Not Found");
});

export default app;

if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
