import { Router } from "express";
import { db, withRLS } from "../db";
import { entries } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

// Get all entries
router.get("/", async (req: any, res) => {
    try {
        const userId = req.session.user.id;
        console.log(`[DEBUG] Fetching entries for userId: "${userId}"`);
        
        const userEntries = await withRLS(userId, (tx) => 
            tx.query.entries.findMany({
                where: eq(entries.userId, userId),
                orderBy: [desc(entries.entryDate)]
            })
        );
        res.json(userEntries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch entries" });
    }
});

// Get today's entry
router.get("/today", async (req: any, res) => {
    try {
        const userId = req.session.user.id;
        const today = new Date().toISOString().split('T')[0];
        const entry = await withRLS(userId, (tx) => 
            tx.query.entries.findFirst({
                where: and(
                    eq(entries.userId, userId),
                    eq(entries.entryDate, today)
                )
            })
        );
        res.json(entry || null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch today's entry" });
    }
});

// Upsert entry
router.post("/", async (req: any, res) => {
    try {
        const body = req.body;
        const userId = req.session.user.id;
        const today = new Date().toISOString().split('T')[0];
        const entryDate = body.entry_date || today;

        const entryData = {
            userId: userId,
            entryDate: entryDate,
            professionalRecap: body.professional_recap,
            personalRecap: body.personal_recap,
            learningReflections: body.learning_reflections,
            gratitude: body.gratitude,
            aiFeedback: body.ai_feedback,
            aiCitedEntries: body.ai_cited_entries,
            completed: body.completed || false,
            updatedAt: new Date(),
        };

        const result = await withRLS(userId, async (tx) => {
            // Check if exists
            const existing = await tx.query.entries.findFirst({
                 where: and(
                    eq(entries.userId, userId),
                    eq(entries.entryDate, entryDate)
                )
            });

            if (existing) {
                // Update
                const [updated] = await tx.update(entries)
                    .set(entryData)
                    .where(eq(entries.id, existing.id))
                    .returning();
                return updated;
            } else {
                // Insert
                const [inserted] = await tx.insert(entries)
                    .values(entryData)
                    .returning();
                return inserted;
            }
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save entry" });
    }
});

// Delete entry
router.delete("/:id", async (req: any, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.user.id;
        await withRLS(userId, (tx) => 
            tx.delete(entries)
                .where(and(
                    eq(entries.id, id),
                    eq(entries.userId, userId)
                ))
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete entry" });
    }
});

export default router;
