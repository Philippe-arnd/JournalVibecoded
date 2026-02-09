import { db, withRLS } from "../db/index";
import { entries } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

async function testRLS() {
    console.log("--- RLS ISOLATION TEST ---");
    
    const userA = "user_a_" + Date.now();
    const userB = "user_b_" + Date.now();
    const today = new Date().toISOString().split('T')[0];

    try {
        console.log(`1. Creating entry for ${userA}...`);
        await withRLS(userA, async (tx) => {
            await tx.insert(entries).values({
                userId: userA,
                entryDate: today,
                professionalRecap: "Private data for User A"
            });
        });

        console.log(`2. Attempting to READ User A's data while logged in as ${userB}...`);
        const resultAsB = await withRLS(userB, async (tx) => {
            return await tx.select().from(entries).where(eq(entries.userId, userA));
        });

        if (resultAsB.length === 0) {
            console.log("✅ SUCCESS: User B cannot see User A's data (RLS is working).");
        } else {
            console.log("❌ FAILURE: User B SAW User A's data!");
        }

        console.log(`3. Attempting to UPDATE User A's data while logged in as ${userB}...`);
        const updateResult = await withRLS(userB, async (tx) => {
            return await tx.update(entries)
                .set({ professionalRecap: "HACKED BY B" })
                .where(eq(entries.userId, userA))
                .returning();
        });

        if (updateResult.length === 0) {
            console.log("✅ SUCCESS: User B cannot update User A's data.");
        } else {
            console.log("❌ FAILURE: User B UPDATED User A's data!");
        }

    } catch (error) {
        console.error("Test failed with error:", error);
    } finally {
        // Cleanup
        console.log("4. Cleaning up test data...");
        // Use a "super" query without RLS context if possible, or just delete as A
        await withRLS(userA, async (tx) => {
            await tx.delete(entries).where(eq(entries.userId, userA));
        });
        console.log("--- TEST COMPLETE ---");
        process.exit(0);
    }
}

testRLS();
