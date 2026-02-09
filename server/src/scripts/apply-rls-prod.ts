import { db } from "../db/index";
import { sql } from "drizzle-orm";

async function applyRLS() {
    console.log("[RLS] Applying Row Level Security policies...");
    try {
        await db.execute(sql`
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
        // On ne fait pas process.exit(1) pour ne pas bloquer le démarrage du serveur
        // si c'est juste un problème de permission mineur, mais on log l'erreur.
    }
}

applyRLS().then(() => process.exit(0));
