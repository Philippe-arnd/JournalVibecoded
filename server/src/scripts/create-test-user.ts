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

    console.log(`Forcing fresh seed for user: ${email} (Password length: ${password.length})`);

    try {
        // Find user
        const existingUser = await db.query.user.findFirst({
            where: eq(user.email, email)
        });

        if (existingUser) {
            console.log("User exists, deleting to ensure fresh credentials...");
            // Delete related accounts and sessions first
            await db.delete(account).where(eq(account.userId, existingUser.id));
            await db.delete(session).where(eq(session.userId, existingUser.id));
            await db.delete(user).where(eq(user.id, existingUser.id));
        }

        // Create fresh user
        const result = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            }
        });
        
        console.log("User created successfully:", email);

        // Always ensure the email is verified in the database
        await db.update(user)
            .set({ emailVerified: true })
            .where(eq(user.email, email));

        console.log("Email verification updated successfully.");
    } catch (error: any) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }

    console.log("Seeding process completed.");
    process.exit(0);
};

seed();
