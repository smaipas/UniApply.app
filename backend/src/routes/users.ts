import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../utils/db";
import { logAudit } from "../utils/audit";
import type { User } from "@uniapply/shared";

const USERS_TABLE = process.env.USERS_TABLE!;
const router = Router();

router.get("/", async (_req, res) =>
  res.json(await db.scan<User>(USERS_TABLE))
);
router.get("/:id", async (req, res) => {
  const item = await db.get<User>(USERS_TABLE, { id: req.params.id });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});
router.post("/", async (req, res) => {
  const d = req.body as Partial<User>;
  if (!d.firstName || d.firstName.length < 2 || d.firstName.length > 64)
    return res.status(400).json({ error: "Invalid firstName" });
  if (!d.lastName || d.lastName.length < 2 || d.lastName.length > 64)
    return res.status(400).json({ error: "Invalid lastName" });
  const now = new Date().toISOString();
  const item: User = {
    id: d.id || uuid(),
    role: d.role,
    firstName: d.firstName,
    lastName: d.lastName,
    studentId: d.studentId,
    userOfficialId: d.userOfficialId,
    userOfficialType: d.userOfficialType,
    tel: d.tel,
    email: d.email,
    address: d.address,
    active: d.active ?? true,
    verified: d.verified ?? false,
    settings: d.settings || {
      dark: false,
      language: "en",
      notificationsEnabled: true,
    },
    createdAt: now,
    updatedAt: now,
  } as User;
  await db.put(USERS_TABLE, item);
  await logAudit({
    entityType: "User",
    entityId: item.id,
    action: "CREATE",
    actorUserId: (req as any).user?.sub || "system",
    details: item,
  });
  res.status(201).json(item);
});
router.put("/:id", async (req, res) => {
  const before = await db.get<User>(USERS_TABLE, { id: req.params.id });
  if (!before) return res.status(404).json({ error: "Not found" });
  const updates = {
    ...(req.body as Partial<User>),
    updatedAt: new Date().toISOString(),
  };
  const after = await db.update<User>(
    USERS_TABLE,
    { id: req.params.id },
    updates
  );
  const changed: any = {};
  Object.keys(updates).forEach((k) => {
    if ((updates as any)[k] !== (before as any)[k])
      changed[k] = (updates as any)[k];
  });
  await logAudit({
    entityType: "User",
    entityId: req.params.id,
    action: "UPDATE",
    actorUserId: (req as any).user?.sub || "system",
    details: changed,
  });
  res.json(after);
});
router.delete("/:id", async (req, res) => {
  await db.delete(USERS_TABLE, { id: req.params.id });
  await logAudit({
    entityType: "User",
    entityId: req.params.id,
    action: "DELETE",
    actorUserId: (req as any).user?.sub || "system",
    details: {},
  });
  res.json({ ok: true });
});
export default router;
