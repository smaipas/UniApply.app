import { Router } from "express";
import { db } from "../utils/db";
import { logAudit } from "../utils/audit";
import type { RoleModel } from "@uniapply/shared";

const ROLES_TABLE = process.env.ROLES_TABLE!;
const router = Router();

router.get("/", async (_req, res) =>
  res.json(await db.scan<RoleModel>(ROLES_TABLE))
);
router.get("/:roleName", async (req, res) => {
  const item = await db.get<RoleModel>(ROLES_TABLE, {
    roleName: req.params.roleName,
  });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});
router.post("/", async (req, res) => {
  const d = req.body as Partial<RoleModel>;
  if (!d.roleName) return res.status(400).json({ error: "roleName required" });
  const now = new Date().toISOString();
  const defaults = {
    canCreateFormTemplates: false,
    canCreateApplications: true,
    canApproveForms: false,
    canModifyApplicationSettings: false,
    canModifyUserData: false,
    canViewApplications: true,
    canViewAllApplications: false,
  };
  const item: RoleModel = {
    roleName: d.roleName!,
    access: { ...defaults, ...(d.access || {}) },
    createdAt: now,
    updatedAt: now,
  };
  await db.put(ROLES_TABLE, item);
  await logAudit({
    entityType: "Role",
    entityId: item.roleName,
    action: "CREATE",
    actorUserId: (req as any).user?.sub || "system",
    details: item,
  });
  res.status(201).json(item);
});
router.put("/:roleName", async (req, res) => {
  const before = await db.get<RoleModel>(ROLES_TABLE, {
    roleName: req.params.roleName,
  });
  if (!before) return res.status(404).json({ error: "Not found" });
  const updates = {
    ...(req.body as Partial<RoleModel>),
    updatedAt: new Date().toISOString(),
  };
  const after = await db.update<RoleModel>(
    ROLES_TABLE,
    { roleName: req.params.roleName },
    updates
  );
  const changed: any = {};
  Object.keys(updates).forEach((k) => {
    if ((updates as any)[k] !== (before as any)[k])
      changed[k] = (updates as any)[k];
  });
  await logAudit({
    entityType: "Role",
    entityId: req.params.roleName,
    action: "UPDATE",
    actorUserId: (req as any).user?.sub || "system",
    details: changed,
  });
  res.json(after);
});
router.delete("/:roleName", async (req, res) => {
  await db.delete(ROLES_TABLE, { roleName: req.params.roleName });
  await logAudit({
    entityType: "Role",
    entityId: req.params.roleName,
    action: "DELETE",
    actorUserId: (req as any).user?.sub || "system",
    details: {},
  });
  res.json({ ok: true });
});
export default router;
