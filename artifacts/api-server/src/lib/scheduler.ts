import cron from "node-cron";
import { lt, isNull, and, not } from "drizzle-orm";
import { db, ordersTable, orderItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";
import { sendOrderReminderEmail } from "./email";

const FINAL_STATUSES = ["shipped", "delivered", "cancelled", "refunded"];
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

async function checkStaleOrders() {
  logger.info("Scheduler: checking for stale orders");

  const cutoff = new Date(Date.now() - THREE_DAYS_MS);

  const staleOrders = await db
    .select()
    .from(ordersTable)
    .where(
      and(
        lt(ordersTable.statusUpdatedAt, cutoff),
        isNull(ordersTable.reminderSentAt),
        not(
          // Exclude orders already in a final state
          // Drizzle doesn't have inArray negation shorthand; filter in JS
          eq(ordersTable.status, "shipped"),
        ),
      ),
    );

  // Further filter out all final statuses in JS
  const actionable = staleOrders.filter(
    (o) => !FINAL_STATUSES.includes(o.status),
  );

  if (actionable.length === 0) {
    logger.info("Scheduler: no stale orders found");
    return;
  }

  logger.info({ count: actionable.length }, "Scheduler: sending reminders");

  for (const order of actionable) {
    try {
      const items = await db
        .select()
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, order.id));

      await sendOrderReminderEmail({ order, items });

      await db
        .update(ordersTable)
        .set({ reminderSentAt: new Date() })
        .where(eq(ordersTable.id, order.id));

      logger.info({ orderId: order.id }, "Scheduler: reminder sent");
    } catch (err) {
      logger.error(
        { err, orderId: order.id },
        "Scheduler: failed to send reminder",
      );
    }
  }
}

export function startScheduler() {
  // Run every day at 9:00 AM UTC
  cron.schedule("0 9 * * *", () => {
    checkStaleOrders().catch((err) =>
      logger.error({ err }, "Scheduler: unhandled error in checkStaleOrders"),
    );
  });

  logger.info("Scheduler: started (daily stale-order check at 09:00 UTC)");
}
