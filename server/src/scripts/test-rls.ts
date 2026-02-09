import { db, withRLS } from "../db/index";
import { entries, user } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

async function testRLS() {
    console.log("--- RLS ISOLATION TEST ---");
    
    const timestamp = Date.now();
    const userA_id = "test_user_a_" + timestamp;
    const userB_id = "test_user_b_" + timestamp;
    const today = new Date().toISOString().split('T')[0];

    try {
        console.log("1. Creating temporary test users...");
        // Create User A
        await db.insert(user).values({
            id: userA_id,
            name: "Test User A",
            email: `a_${timestamp}@test.com`,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        // Create User B
        await db.insert(user).values({
            id: userB_id,
            name: "Test User B",
            email: `b_${timestamp}@test.com`,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log(`2. Creating entry for ${userA_id}...`);
        await withRLS(userA_id, async (tx) => {
            await tx.insert(entries).values({
                userId: userA_id,
                entryDate: today,
                professionalRecap: "Private data for User A"
            });
        });

        console.log(`3. Attempting to READ User A's data while logged in as ${userB_id}...`);
        const resultAsB = await withRLS(userB_id, async (tx) => {
            return await tx.select().from(entries).where(eq(entries.userId, userA_id));
        });

        if (resultAsB.length === 0) {
            console.log("✅ SUCCESS: User B cannot see User A's data (RLS is working).");
        } else {
            console.log("❌ FAILURE: User B SAW User A's data!");
        }

        console.log(`4. Attempting to UPDATE User A's data while logged in as ${userB_id}...`);
        const updateResult = await withRLS(userB_id, async (tx) => {
            return await tx.update(entries)
                .set({ professionalRecap: "HACKED BY B" })
                .where(eq(entries.userId, userA_id))
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
        console.log("5. Cleaning up test data...");
        try {
            // Delete entries first (FK constraint)
            await db.delete(entries).where(sql`user_id IN (${userA_id}, ${userB_id})`);
            // Delete users
            await db.delete(user).where(sql`id IN (${userA_id}, ${userB_id})`);
            console.log("✅ Cleanup successful.");
        } catch (cleanupError) {
            console.error("Cleanup failed:", cleanupError);
        }
        console.log("--- TEST COMPLETE ---");
        process.exit(0);
    }
}

testRLS();
