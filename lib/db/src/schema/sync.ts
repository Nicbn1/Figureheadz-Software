import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

// Singleton row (id = 1) tracking the last Square catalog/inventory sync.
export const syncStateTable = pgTable("sync_state", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("idle"),
  mode: text("mode").notNull().default("demo"),
  itemsSynced: integer("items_synced").notNull().default(0),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  message: text("message"),
});

export type SyncStateRow = typeof syncStateTable.$inferSelect;
