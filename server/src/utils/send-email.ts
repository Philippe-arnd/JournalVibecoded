import { Resend } from "resend";
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
    to,
    subject,
    templateName,
    data
}: {
    to: string;
    subject: string;
    templateName: string;
    data: Record<string, string>;
}) {
    console.log(`Attempting to send email to ${to} with template ${templateName}`);
    console.log(`Email data:`, JSON.stringify(data, null, 2));
    try {
        const templatePath = path.join(process.cwd(), "src/templates", templateName);
        console.log(`Reading template from: ${templatePath}`);
        let html = fs.readFileSync(templatePath, "utf-8");

        // Simple template replacement
        Object.entries(data).forEach(([key, value]) => {
            html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });

        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || "onboarding@resend.dev",
            to,
            subject,
            html
        });
        console.log("Resend API response:", result);
    } catch (error) {
        console.error("Failed to send email:", error);
        throw error;
    }
}
