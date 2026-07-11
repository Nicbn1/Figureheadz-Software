import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoriesTable.id),
  franchise: text("franchise").notNull(),
  priceCents: integer("price_cents").notNull(),
  salePriceCents: integer("sale_price_cents"),
  isExclusive: boolean("is_exclusive").notNull().default(false),
  isOnSale: boolean("is_on_sale").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  images: text("images").array().notNull().default([]),
  popularityScore: integer("popularity_score").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

export const productVariationsTable = pgTable("product_variations", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  priceCents: integer("price_cents").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductVariationSchema = createInsertSchema(
  productVariationsTable,
).omit({ id: true, createdAt: true });
export type InsertProductVariation = z.infer<typeof insertProductVariationSchema>;
export type ProductVariation = typeof productVariationsTable.$inferSelect;
