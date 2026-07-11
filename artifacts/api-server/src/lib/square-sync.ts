import { sql } from "drizzle-orm";
import { db, productsTable, syncStateTable } from "@workspace/db";
import { logger } from "./logger";

/**
 * Square catalog/inventory sync.
 *
 * When SQUARE_ACCESS_TOKEN is configured (via the Square connector), this is
 * the place to call the Square Catalog/Inventory APIs and upsert results into
 * `productsTable` / `productVariationsTable`. Until then, the storefront runs
 * in "demo" mode against the seeded catalog so the site is fully functional
 * end-to-end without requiring live Square credentials.
 */
export async function runSquareSync(): Promise<{
  status: "success" | "error";
  mode: "demo" | "live";
  itemsSynced: number;
  message: string;
  lastSyncedAt: Date;
}> {
  const hasSquareCredentials = Boolean(process.env["SQUARE_ACCESS_TOKEN"]);
  const mode: "demo" | "live" = hasSquareCredentials ? "live" : "demo";

  if (!hasSquareCredentials) {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(productsTable);

    const result = {
      status: "success" as const,
      mode,
      itemsSynced: count,
      message:
        "Running in demo mode with seeded catalog data. Connect Square to sync your real catalog, inventory, and orders.",
      lastSyncedAt: new Date(),
    };

    await persistSyncState(result);
    return result;
  }

  // TODO: once the Square connector is attached, replace this branch with
  // real Catalog + Inventory API calls and upsert into productsTable /
  // productVariationsTable, keyed by Square catalog object id.
  logger.warn(
    "SQUARE_ACCESS_TOKEN present but live sync is not yet implemented; falling back to demo counts",
  );
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable);

  const result = {
    status: "success" as const,
    mode,
    itemsSynced: count,
    message: "Square credentials detected, but live sync is not implemented yet.",
    lastSyncedAt: new Date(),
  };
  await persistSyncState(result);
  return result;
}

async function persistSyncState(result: {
  status: "success" | "error";
  mode: "demo" | "live";
  itemsSynced: number;
  message: string;
  lastSyncedAt: Date;
}): Promise<void> {
  const existing = await db.select().from(syncStateTable).limit(1);
  const values = {
    status: result.status,
    mode: result.mode,
    itemsSynced: result.itemsSynced,
    lastSyncedAt: result.lastSyncedAt,
    message: result.message,
  };

  if (existing.length > 0 && existing[0]) {
    await db
      .update(syncStateTable)
      .set(values)
      .where(sql`${syncStateTable.id} = ${existing[0].id}`);
  } else {
    await db.insert(syncStateTable).values(values);
  }
}

export async function getSyncState() {
  const rows = await db.select().from(syncStateTable).limit(1);
  return rows[0] ?? null;
}
