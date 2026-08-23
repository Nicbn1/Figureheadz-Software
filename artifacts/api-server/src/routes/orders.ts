import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import {
  db,
  cartsTable,
  cartItemsTable,
  ordersTable,
  orderItemsTable,
  productVariationsTable,
} from "@workspace/db";
import {
  CreateOrderBody,
  CreateOrderResponse,
  ListOrdersByEmailQueryParams,
  ListOrdersByEmailResponse,
  GetOrderParams,
  GetOrderResponse,
} from "@workspace/api-zod";
import { loadCart } from "../lib/cart-helpers";
import { calculateShippingCents, calculateTaxCents } from "../lib/pricing";
import { sendOrderConfirmationEmail } from "../lib/email";
import { logger } from "../lib/logger";

const router: IRouter = Router();

async function shapeOrder(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) return null;
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));

  return {
    id: order.id,
    email: order.email,
    shippingAddress: {
      fullName: order.fullName,
      line1: order.line1,
      line2: order.line2,
      city: order.city,
      state: order.state,
      postalCode: order.postalCode,
      country: order.country,
    },
    items,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    taxCents: order.taxCents,
    totalCents: order.totalCents,
    status: order.status,
    squareOrderId: order.squareOrderId,
    createdAt: order.createdAt,
  };
}

router.post("/orders", async (req, res): Promise<void> => {
  const body = CreateOrderBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [cart] = await db.select().from(cartsTable).where(eq(cartsTable.id, body.data.cartId));
  if (!cart) {
    res.status(400).json({ error: "Cart not found" });
    return;
  }

  const loadedCart = await loadCart(cart.id);
  if (!loadedCart || loadedCart.items.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  for (const item of loadedCart.items) {
    if (item.quantity > item.availableStock) {
      res.status(400).json({
        error: `${item.productName} (${item.variationName}) only has ${item.availableStock} left in stock`,
      });
      return;
    }
  }

  const destination = {
    state: body.data.shippingAddress.state,
    country: body.data.shippingAddress.country,
  };

  const subtotalCents = loadedCart.subtotalCents;
  const shippingCents = calculateShippingCents(destination);
  const taxCents = calculateTaxCents(subtotalCents, destination);
  const totalCents = subtotalCents + shippingCents + taxCents;

  const [order] = await db
    .insert(ordersTable)
    .values({
      email: body.data.email,
      fullName: body.data.shippingAddress.fullName,
      line1: body.data.shippingAddress.line1,
      line2: body.data.shippingAddress.line2 ?? null,
      city: body.data.shippingAddress.city,
      state: body.data.shippingAddress.state,
      postalCode: body.data.shippingAddress.postalCode,
      country: body.data.shippingAddress.country,
      subtotalCents,
      shippingCents,
      taxCents,
      totalCents,
      status: "paid",
      // Populated once the Square connector is attached and a real payment
      // + order is created via the Square Orders API.
      squareOrderId: null,
    })
    .returning();

  if (!order) {
    res.status(500).json({ error: "Failed to create order" });
    return;
  }

  await db.insert(orderItemsTable).values(
    loadedCart.items.map((item) => ({
      orderId: order.id,
      productName: item.productName,
      variationName: item.variationName,
      sku: item.sku,
      imageUrl: item.imageUrl,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
      lineTotalCents: item.lineTotalCents,
    })),
  );

  for (const item of loadedCart.items) {
    await db
      .update(productVariationsTable)
      .set({ stockQuantity: item.availableStock - item.quantity })
      .where(eq(productVariationsTable.id, item.variationId));
  }

  await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id));

  const shaped = await shapeOrder(order.id);

  // Fire-and-forget — don't let email failure block the 201 response
  const orderItems = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  sendOrderConfirmationEmail({ order, items: orderItems }).catch((err) => {
    logger.error({ err, orderId: order.id }, "Failed to send order confirmation email");
  });

  res.status(201).json(CreateOrderResponse.parse(shaped));
});

router.get("/orders", async (req, res): Promise<void> => {
  const query = ListOrdersByEmailQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.email, query.data.email))
    .orderBy(desc(ordersTable.createdAt));

  const shaped = await Promise.all(orders.map((o) => shapeOrder(o.id)));
  res.json(ListOrdersByEmailResponse.parse(shaped));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const shaped = await shapeOrder(params.data.id);
  if (!shaped) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(GetOrderResponse.parse(shaped));
});

export default router;
