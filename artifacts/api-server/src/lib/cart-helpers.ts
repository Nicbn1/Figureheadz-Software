import { eq } from "drizzle-orm";
import {
  db,
  cartItemsTable,
  productVariationsTable,
  productsTable,
} from "@workspace/db";
import type { Cart } from "@workspace/api-zod";

/**
 * Loads a cart and joins in product/variation details, computing line totals
 * and the cart subtotal. Returns null if the cart does not exist.
 */
export async function loadCart(cartId: string): Promise<Cart | null> {
  const rows = await db
    .select({
      id: cartItemsTable.id,
      quantity: cartItemsTable.quantity,
      variationId: productVariationsTable.id,
      variationName: productVariationsTable.name,
      sku: productVariationsTable.sku,
      unitPriceCents: productVariationsTable.priceCents,
      stockQuantity: productVariationsTable.stockQuantity,
      variationImageUrl: productVariationsTable.imageUrl,
      productId: productsTable.id,
      productSlug: productsTable.slug,
      productName: productsTable.name,
      productImages: productsTable.images,
    })
    .from(cartItemsTable)
    .innerJoin(
      productVariationsTable,
      eq(cartItemsTable.variationId, productVariationsTable.id),
    )
    .innerJoin(productsTable, eq(productVariationsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.cartId, cartId));

  const items = rows.map((row) => ({
    id: row.id,
    variationId: row.variationId,
    productId: row.productId,
    productSlug: row.productSlug,
    productName: row.productName,
    variationName: row.variationName,
    sku: row.sku,
    imageUrl: row.variationImageUrl ?? row.productImages[0] ?? null,
    unitPriceCents: row.unitPriceCents,
    quantity: row.quantity,
    lineTotalCents: row.unitPriceCents * row.quantity,
    availableStock: row.stockQuantity,
  }));

  return {
    id: cartId,
    items,
    subtotalCents: items.reduce((sum, item) => sum + item.lineTotalCents, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}
