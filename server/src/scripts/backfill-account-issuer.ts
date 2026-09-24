import { adminDb } from "../db/index";
import { sql } from "drizzle-orm";

// better-auth 1.7 added an `issuer` column to `account` and requires it to
// match on sign-in (see node_modules/better-auth/dist/api/routes/sign-in.mjs:
// credentialAccount lookup checks providerId AND issuer AND accountId).
// Rows created before the 1.6.29 -> 1.7.2 bump (Renovate #216, 2026-08-30)
// have no issuer, so every credential sign-in silently fails with
// INVALID_EMAIL_OR_PASSWORD regardless of the password. This backfill sets
// issuer to the same value better-auth computes itself for local accounts
// (`local:${providerId}`, see @better-auth/core/db createLocalAccountIssuer).
async function backfillAccountIssuer() {
    console.log("[BACKFILL] Setting issuer on account rows missing it...");
    try {
        const result = await adminDb.execute(sql`
            UPDATE "account"
            SET issuer = 'local:' || provider_id
            WHERE issuer IS NULL;
        `);
        console.log(`[BACKFILL] Done (${result.rowCount ?? 0} row(s) updated).`);
    } catch (error) {
        console.error("[BACKFILL] Error backfilling account.issuer:", error);
        // Don't block server startup — same rationale as apply-rls-prod.ts.
    }
}

backfillAccountIssuer().then(() => process.exit(0));
