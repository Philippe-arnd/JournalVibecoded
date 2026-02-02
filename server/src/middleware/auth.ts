import { auth } from "../auth";
import { fromNodeHeaders } from "better-auth/node";

export const requireAuth = async (req: any, res: any, next: any) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    });

    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    req.session = session;
    next();
};
