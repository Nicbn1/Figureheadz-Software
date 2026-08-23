import { Router, type IRouter } from "express";
import { eq, gte, sql } from "drizzle-orm";
import { db, appearancesTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";
import { z } from "zod/v4";

const AppearanceBody = z.object({
  name: z.string(),
  date: z.string(),
  endDate: z.string().nullable().optional(),
  location: z.string(),
  description: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
});

const CreateAppearanceBody = AppearanceBody;
const UpdateAppearanceBody = AppearanceBody;

const router: IRouter = Router();

// Public: list upcoming appearances (today and future, sorted by date)
// For multi-day events, uses end_date so they stay visible through their last day
router.get("/appearances", async (_req, res): Promise<void> => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const rows = await db
    .select()
    .from(appearancesTable)
    .where(gte(sql`COALESCE(${appearancesTable.endDate}, ${appearancesTable.date})`, today))
    .orderBy(appearancesTable.date);
  res.json(rows);
});

// Admin: list all appearances (including past)
router.get("/admin/appearances", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(appearancesTable)
    .orderBy(appearancesTable.date);
  res.json(rows);
});

// Admin: create appearance
router.post("/admin/appearances", requireAdmin, async (req, res): Promise<void> => {
  const body = CreateAppearanceBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [row] = await db
    .insert(appearancesTable)
    .values({
      name: body.data.name,
      date: body.data.date,
      endDate: body.data.endDate ?? null,
      location: body.data.location,
      description: body.data.description ?? null,
      link: body.data.link ?? null,
    })
    .returning();

  res.status(201).json(row);
});

// Admin: update appearance
router.put("/admin/appearances/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params["id"]), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const body = UpdateAppearanceBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [row] = await db
    .update(appearancesTable)
    .set({
      name: body.data.name,
      date: body.data.date,
      endDate: body.data.endDate ?? null,
      location: body.data.location,
      description: body.data.description ?? null,
      link: body.data.link ?? null,
    })
    .where(eq(appearancesTable.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(row);
});

// Admin: delete appearance
router.delete("/admin/appearances/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params["id"]), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .delete(appearancesTable)
    .where(eq(appearancesTable.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({ success: true });
});

export default router;
