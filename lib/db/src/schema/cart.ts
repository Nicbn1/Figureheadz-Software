import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { productVariationsTable } from "./products";

export const cartsTable = pgTable("carts", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Cart = typeof cartsTable.$inferSelect;

export const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: text("cart_id")
    .notNull()
    .references(() => cartsTable.id),
  variationId: integer("variation_id")
    .notNull()
    .references(() => productVariationsTable.id),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCartItemSchema = createInsertSchema(cartItemsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItemRow = typeof cartItemsTable.$inferSelect;
