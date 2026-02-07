import { db } from "../db/index";
import { user, account, session } from "../db/schema";
import { auth } from "../auth";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

// Load environment variables if .env exists (local development)
dotenv.config();

const seed = async () => {
    const email = process.env.TEST_USER_EMAIL || "test@philapps.com";
    const password = process.env.TEST_USER_PWD || "password123";
    const name = "Test User";

    console.log(`[SEED] Starting seeding for: ${email}`);

    try {
        // Find existing user using standard select
        const existingUsers = await db.select().from(user).where(eq(user.email, email)).limit(1);
        const existingUser = existingUsers[0];

        if (existingUser) {
            console.log("[SEED] User exists, deleting to ensure fresh credentials...");
            // Delete related records
            await db.delete(account).where(eq(account.userId, existingUser.id));
            await db.delete(session).where(eq(session.userId, existingUser.id));
            await db.delete(user).where(eq(user.id, existingUser.id));
        }

        console.log("[SEED] Creating fresh test user...");
        // Create fresh user via Better Auth API
        await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            }
        });
        
        console.log("[SEED] User created, forcing email verification...");

        // Ensure email is verified
        await db.update(user)
            .set({ emailVerified: true })
            .where(eq(user.email, email));

        console.log("[SEED] Seeding completed successfully.");
    } catch (error: any) {
        console.error("[SEED] Error during seeding process:", error?.message || error);
        // We don't process.exit(1) here to allow the server to start anyway
    }
};

seed().then(() => {
    process.exit(0);
}).catch((err) => {
    console.error("[SEED] Unhandled error:", err);
    process.exit(0); // Exit gracefully to not block container startup
});