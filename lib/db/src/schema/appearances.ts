import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const appearancesTable = pgTable("appearances", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(), // ISO date string: YYYY-MM-DD
  endDate: text("end_date"), // ISO date string: YYYY-MM-DD (optional, for multi-day events)
  location: text("location").notNull(),
  description: text("description"),
  link: text("link"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAppearanceSchema = createInsertSchema(appearancesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertAppearance = z.infer<typeof insertAppearanceSchema>;
export type Appearance = typeof appearancesTable.$inferSelect;
