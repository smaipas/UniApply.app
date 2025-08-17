import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../utils/db";
import { logAudit } from "../utils/audit";
import type { FormTemplate } from "@uniapply/shared";

const FORMS_TABLE = process.env.FORMS_TABLE!;
const router = Router();

router.get("/", async (_req, res) =>
  res.json(await db.scan<FormTemplate>(FORMS_TABLE))
);
router.get("/:id", async (req, res) => {
  const item = await db.get<FormTemplate>(FORMS_TABLE, { id: req.params.id });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});
router.post("/", async (req, res) => {
  const d = req.body as Partial<FormTemplate>;
  if (!d.title || d.title.length < 2 || d.title.length > 64)
    return res.status(400).json({ error: "Invalid title" });
  const now = new Date().toISOString();
  const item: FormTemplate = {
    id: d.id || uuid(),
    title: d.title,
    description: d.description || "",
    fields: d.fields || [],
    approvalSteps: (d.approvalSteps || []).map((s: any, i: number) => ({
      ...s,
      stepOrder: s.stepOrder ?? i + 1,
    })),
    visibleToRoles: d.visibleToRoles || [],
    active: d.active ?? true,
    createdAt: now,
    updatedAt: now,
  };
  await db.put(FORMS_TABLE, item);
  await logAudit({
    entityType: "FormTemplate",
    entityId: item.id,
    action: "CREATE",
    actorUserId: (req as any).user?.sub || "system",
    details: item,
  });
  res.status(201).json(item);
});
router.put("/:id", async (req, res) => {
  const before = await db.get<FormTemplate>(FORMS_TABLE, { id: req.params.id });
  if (!before) return res.status(404).json({ error: "Not found" });
  const updates = {
    ...(req.body as Partial<FormTemplate>),
    updatedAt: new Date().toISOString(),
  };
  const after = await db.update<FormTemplate>(
    FORMS_TABLE,
    { id: req.params.id },
    updates
  );
  const changed: any = {};
  Object.keys(updates).forEach((k) => {
    if ((updates as any)[k] !== (before as any)[k])
      changed[k] = (updates as any)[k];
  });
  await logAudit({
    entityType: "FormTemplate",
    entityId: req.params.id,
    action: "UPDATE",
    actorUserId: (req as any).user?.sub || "system",
    details: changed,
  });
  res.json(after);
});
router.delete("/:id", async (req, res) => {
  await db.delete(FORMS_TABLE, { id: req.params.id });
  await logAudit({
    entityType: "FormTemplate",
    entityId: req.params.id,
    action: "DELETE",
    actorUserId: (req as any).user?.sub || "system",
    details: {},
  });
  res.json({ ok: true });
});
export default router;
