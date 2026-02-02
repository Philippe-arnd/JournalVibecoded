import { pgTable, text, timestamp, boolean, uuid, date, unique } from "drizzle-orm/pg-core";

// Auth Tables
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id").notNull().references(() => user.id),
        createdAt: timestamp("created_at").notNull(),
        updatedAt: timestamp("updated_at").notNull(),
});
export const account = pgTable("account", {
        id: text("id").primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id").notNull().references(() => user.id),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        expiresAt: timestamp("expires_at"),
        password: text("password"),
        createdAt: timestamp("created_at").notNull(),
        updatedAt: timestamp("updated_at").notNull(),
});
export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});

// Application Tables
export const entries = pgTable("entries", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    entryDate: date("entry_date").notNull(),
    professionalRecap: text("professional_recap"),
    personalRecap: text("personal_recap"),
    learningReflections: text("learning_reflections"),
    gratitude: text("gratitude"),
    aiFeedback: text("ai_feedback"),
    aiCitedEntries: text("ai_cited_entries"), // Encrypted JSON string
    completed: boolean("completed").default(false),
    updatedAt: timestamp("updated_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
    unq: unique().on(t.userId, t.entryDate),
}));

export const milestones = pgTable("milestones", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => user.id),
    milestoneType: text("milestone_type").notNull(),
    achievedAt: timestamp("achieved_at").defaultNow(),
});

