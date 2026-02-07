import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { sendEmail } from "./utils/send-email";
import * as schema from "./db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema 
    }),
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        async sendResetPassword({ url, user }: { url: string; user: any }) {
             await sendEmail({
                 to: user.email,
                 subject: "Reset Password",
                 templateName: "reset_password.html",
                 data: { url }
             });
        },
    },
    emailVerification: {
        async sendVerificationEmail({ url, user }: { url: string; user: any }) {
             // Append the correct callbackURL to the generated verification link
             const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
             const verificationUrl = new URL(url);
             verificationUrl.searchParams.set("callbackURL", frontendUrl + "/home");
             
             await sendEmail({
                 to: user.email,
                 subject: "Verify Email",
                 templateName: "confirm_signup.html",
                 data: { url: verificationUrl.toString() }
             });
        },
        autoSignInAfterVerification: true,
    },
    // Add other plugins or config as needed
    trustedOrigins: [
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ].filter(Boolean) as string[],
});
