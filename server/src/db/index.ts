import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import "dotenv/config";
import { sql } from "drizzle-orm";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

/**
 * Executes a callback within a database transaction with RLS context set.
 * This ensures that Row Level Security policies are correctly applied
 * using the provided userId.
 */
export async function withRLS<T>(userId: string, callback: (tx: any) => Promise<T>): Promise<T> {
  return await db.transaction(async (tx) => {
    // Set the session variable that our RLS policies use
    await tx.execute(sql`SET LOCAL app.current_user_id = ${userId}`);
    return await callback(tx);
  });
}
