import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import { AdminLoginBody, AdminLoginResponse, GetSyncStatusResponse, TriggerSyncResponse, GetSalesSummaryResponse } from "@workspace/api-zod";
import { issueAdminToken, checkAdminPassword, requireAdmin } from "../lib/admin-auth";
import { getSyncState, runSquareSync } from "../lib/square-sync";

const router: IRouter = Router();

router.post("/admin/login", async (req, res): Promise<void> => {
  const body = AdminLoginBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  if (!checkAdminPassword(body.data.password)) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  res.json(AdminLoginResponse.parse({ token: issueAdminToken() }));
});

router.get("/admin/sync-status", requireAdmin, async (_req, res): Promise<void> => {
  const state = await getSyncState();
  res.json(
    GetSyncStatusResponse.parse(
      state ?? {
        status: "idle",
        mode: "demo",
        itemsSynced: 0,
        lastSyncedAt: null,
        message: "No sync has run yet.",
      },
    ),
  );
});

router.post("/admin/sync", requireAdmin, async (_req, res): Promise<void> => {
  const result = await runSquareSync();
  res.json(TriggerSyncResponse.parse(result));
});

router.get("/admin/sales-summary", requireAdmin, async (_req, res): Promise<void> => {
  const [{ totalOrders, totalRevenueCents }] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      totalRevenueCents: sql<number>`coalesce(sum(${ordersTable.totalCents}), 0)::int`,
    })
    .from(ordersTable);

  const [{ ordersLast7Days }] = await db
    .select({ ordersLast7Days: sql<number>`count(*)::int` })
    .from(ordersTable)
    .where(sql`${ordersTable.createdAt} > now() - interval '7 days'`);

  const topProducts = await db.execute(sql`
    select oi.product_name as "productName",
           sum(oi.quantity)::int as "unitsSold",
           sum(oi.line_total_cents)::int as "revenueCents"
    from order_items oi
    group by oi.product_name
    order by sum(oi.line_total_cents) desc
    limit 5
  `);

  res.json(
    GetSalesSummaryResponse.parse({
      totalOrders,
      totalRevenueCents,
      ordersLast7Days,
      topProducts: topProducts.rows,
    }),
  );
});

export default router;
