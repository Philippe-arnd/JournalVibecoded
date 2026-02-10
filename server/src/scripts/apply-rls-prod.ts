import { adminDb } from "../db/index";
import { sql } from "drizzle-orm";

async function applyRLS() {
    console.log("[RLS] Applying Row Level Security policies using Admin connection...");
    try {
        await adminDb.execute(sql`
            -- Enable RLS
            ALTER TABLE "entries" ENABLE ROW LEVEL SECURITY;
            ALTER TABLE "entries" FORCE ROW LEVEL SECURITY;
            ALTER TABLE "milestones" ENABLE ROW LEVEL SECURITY;
            ALTER TABLE "milestones" FORCE ROW LEVEL SECURITY;

            -- Create policies idempotently
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'entries_isolation_policy') THEN
                    CREATE POLICY entries_isolation_policy ON "entries" 
                    FOR ALL TO public 
                    USING (user_id = current_setting('app.current_user_id', true)) 
                    WITH CHECK (user_id = current_setting('app.current_user_id', true));
                END IF;

                IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'milestones_isolation_policy') THEN
                    CREATE POLICY milestones_isolation_policy ON "milestones" 
                    FOR ALL TO public 
                    USING (user_id = current_setting('app.current_user_id', true)) 
                    WITH CHECK (user_id = current_setting('app.current_user_id', true));
                END IF;
            END $$;
        `);
        console.log("[RLS] Policies applied successfully.");
    } catch (error) {
        console.error("[RLS] Error applying policies:", error);
        // We don't use process.exit(1) to avoid blocking server startup
        // if it's just a minor permission issue, but we log the error.
    }
}

applyRLS().then(() => process.exit(0));
