import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, cartsTable, cartItemsTable, productVariationsTable } from "@workspace/db";
import { CreateCartResponse, GetCartParams, AddCartItemParams, AddCartItemBody, UpdateCartItemParams, UpdateCartItemBody, RemoveCartItemParams } from "@workspace/api-zod";
import { loadCart } from "../lib/cart-helpers";

const router: IRouter = Router();

router.post("/cart", async (_req, res): Promise<void> => {
  const id = randomUUID();
  await db.insert(cartsTable).values({ id });
  const cart = await loadCart(id);
  res.status(201).json(CreateCartResponse.parse(cart));
});

router.get("/cart/:cartId", async (req, res): Promise<void> => {
  const params = GetCartParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db.select().from(cartsTable).where(eq(cartsTable.id, params.data.cartId));
  if (!existing) {
    res.status(404).json({ error: "Cart not found" });
    return;
  }

  res.json(await loadCart(params.data.cartId));
});

router.post("/cart/:cartId/items", async (req, res): Promise<void> => {
  const params = AddCartItemParams.safeParse(req.params);
  const body = AddCartItemBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: (params.error ?? body.error)?.message });
    return;
  }

  const [cart] = await db.select().from(cartsTable).where(eq(cartsTable.id, params.data.cartId));
  if (!cart) {
    res.status(404).json({ error: "Cart not found" });
    return;
  }

  const [variation] = await db
    .select()
    .from(productVariationsTable)
    .where(eq(productVariationsTable.id, body.data.variationId));
  if (!variation) {
    res.status(400).json({ error: "Variation not found" });
    return;
  }

  const [existingItem] = await db
    .select()
    .from(cartItemsTable)
    .where(
      and(eq(cartItemsTable.cartId, cart.id), eq(cartItemsTable.variationId, variation.id)),
    );

  const nextQuantity = (existingItem?.quantity ?? 0) + body.data.quantity;
  if (nextQuantity > variation.stockQuantity) {
    res.status(400).json({ error: `Only ${variation.stockQuantity} left in stock` });
    return;
  }

  if (existingItem) {
    await db
      .update(cartItemsTable)
      .set({ quantity: nextQuantity })
      .where(eq(cartItemsTable.id, existingItem.id));
  } else {
    await db.insert(cartItemsTable).values({
      cartId: cart.id,
      variationId: variation.id,
      quantity: body.data.quantity,
    });
  }

  res.json(await loadCart(cart.id));
});

router.patch("/cart/:cartId/items/:itemId", async (req, res): Promise<void> => {
  const params = UpdateCartItemParams.safeParse(req.params);
  const body = UpdateCartItemBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: (params.error ?? body.error)?.message });
    return;
  }

  const [item] = await db
    .select()
    .from(cartItemsTable)
    .where(
      and(eq(cartItemsTable.id, params.data.itemId), eq(cartItemsTable.cartId, params.data.cartId)),
    );
  if (!item) {
    res.status(404).json({ error: "Cart item not found" });
    return;
  }

  const [variation] = await db
    .select()
    .from(productVariationsTable)
    .where(eq(productVariationsTable.id, item.variationId));

  if (variation && body.data.quantity > variation.stockQuantity) {
    res.status(400).json({ error: `Only ${variation.stockQuantity} left in stock` });
    return;
  }

  await db
    .update(cartItemsTable)
    .set({ quantity: body.data.quantity })
    .where(eq(cartItemsTable.id, item.id));

  res.json(await loadCart(params.data.cartId));
});

router.delete("/cart/:cartId/items/:itemId", async (req, res): Promise<void> => {
  const params = RemoveCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const deleted = await db
    .delete(cartItemsTable)
    .where(
      and(eq(cartItemsTable.id, params.data.itemId), eq(cartItemsTable.cartId, params.data.cartId)),
    )
    .returning();

  if (deleted.length === 0) {
    res.status(404).json({ error: "Cart item not found" });
    return;
  }

  res.json(await loadCart(params.data.cartId));
});

export default router;
