import { Router } from "express";
import { db } from "../db";
import { entries } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

// Get all entries
router.get("/", async (req: any, res) => {
    try {
        const userEntries = await db.query.entries.findMany({
            where: eq(entries.userId, req.session.user.id),
            orderBy: [desc(entries.entryDate)]
        });
        res.json(userEntries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch entries" });
    }
});

// Get today's entry
router.get("/today", async (req: any, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const entry = await db.query.entries.findFirst({
            where: and(
                eq(entries.userId, req.session.user.id),
                eq(entries.entryDate, today)
            )
        });
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

        // Map camelCase to snake_case schema (or match schema definition)
        // Schema definition uses camelCase keys in object but snake_case in DB
        // Drizzle handles this mapping if we use the object keys
        
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
            updatedAt: new Date(), // Manually update this
        };

        // Check if exists
        const existing = await db.query.entries.findFirst({
             where: and(
                eq(entries.userId, userId),
                eq(entries.entryDate, entryDate)
            )
        });

        let result;
        if (existing) {
            // Update
            [result] = await db.update(entries)
                .set(entryData)
                .where(eq(entries.id, existing.id))
                .returning();
        } else {
            // Insert
            [result] = await db.insert(entries)
                .values(entryData)
                .returning();
        }

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
        await db.delete(entries)
            .where(and(
                eq(entries.id, id),
                eq(entries.userId, req.session.user.id) // Ensure ownership
            ));
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete entry" });
    }
});

export default router;
