import { Router } from "express";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { db } from "../utils/db";
import { logAudit } from "../utils/audit";
import { sendEmail } from "../utils/ses";

import {
  ApplicationCreateSchema,
  ApplicationUpdateSchema,
  type Application,
  type ApplicationStatus,
} from "@uniapply/shared";

const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE!;
const USERS_TABLE = process.env.USERS_TABLE!;
const router = Router();

// ------- Query validation -------
const ListQuerySchema = z.object({
  userId: z.string().min(1).optional(),
  status: z
    .enum(["DRAFT", "APPROVED", "REJECTED", "PENDING_APPROVAL"])
    .optional(),
});

const nowIso = () => new Date().toISOString();

function normalizeSteps(input: unknown[]): Application["approvalSteps"] {
  return (input || []).map((s: any) => ({
    role: String(s.role),
    status:
      s?.status === "APPROVED" || s?.status === "REJECTED"
        ? s.status
        : "PENDING_APPROVAL",
    statusText: typeof s?.statusText === "string" ? s.statusText : "",
    // updatedAt is optional and will be set when a decision is made
  }));
}

function diff<T extends Record<string, unknown>>(before: T, after: T) {
  const changed: Record<string, unknown> = {};
  for (const k of new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ])) {
    const a = before?.[k];
    const b = after?.[k];
    if (JSON.stringify(a) !== JSON.stringify(b)) changed[k] = b;
  }
  return changed;
}

router.get("/", async (req, res) => {
  const parsed = ListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid query", details: parsed.error.format() });
  }
  const { userId, status } = parsed.data;

  if (userId) {
    const items = await db.query<Application>({
      TableName: APPLICATIONS_TABLE,
      IndexName: "userId-index",
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: { ":u": userId },
    });
    return res.json(items);
  }
  if (status) {
    const items = await db.query<Application>({
      TableName: APPLICATIONS_TABLE,
      IndexName: "status-index",
      KeyConditionExpression: "status = :s",
      ExpressionAttributeValues: { ":s": status },
    });
    return res.json(items);
  }

  res.json(await db.scan<Application>(APPLICATIONS_TABLE));
});

router.get("/:id", async (req, res) => {
  const item = await db.get<Application>(APPLICATIONS_TABLE, {
    id: req.params.id,
  });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

router.post("/", async (req, res) => {
  const pre = {
    ...req.body,
    approvalSteps: normalizeSteps((req.body?.approvalSteps as unknown[]) || []),
    status: "DRAFT",
  };
  const parsed = ApplicationCreateSchema.safeParse(pre);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: parsed.error.format() });
  }
  const d = parsed.data;

  const now = nowIso();
  const item: Application = {
    id: uuid(), // <-- always server-generated (fixes d.id error)
    userId: d.userId,
    formId: d.formId,
    fields: d.fields || {},
    approvalSteps: d.approvalSteps,
    status: "DRAFT",
    createdAt: now,
    updatedAt: now,
  };

  await db.put(APPLICATIONS_TABLE, item);
  await logAudit({
    entityType: "Application",
    entityId: item.id,
    action: "CREATE",
    actorUserId: (req as any).user?.sub || "system",
    details: item,
  });
  res.status(201).json(item);
});

router.put("/:id", async (req, res) => {
  const before = await db.get<Application>(APPLICATIONS_TABLE, {
    id: req.params.id,
  });
  if (!before) return res.status(404).json({ error: "Not found" });
  if (before.status !== "DRAFT") {
    return res
      .status(400)
      .json({ error: "Only DRAFT applications can be edited" });
  }

  const pre = {
    ...req.body,
    ...(req.body?.approvalSteps
      ? { approvalSteps: normalizeSteps(req.body.approvalSteps as unknown[]) }
      : {}),
  };
  const parsed = ApplicationUpdateSchema.safeParse(pre);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: parsed.error.format() });
  }

  const updates = {
    ...parsed.data,
    updatedAt: nowIso(),
  };

  const after = await db.update<Application>(
    APPLICATIONS_TABLE,
    { id: req.params.id },
    updates
  );
  await logAudit({
    entityType: "Application",
    entityId: req.params.id,
    action: "UPDATE",
    actorUserId: (req as any).user?.sub || "system",
    details: diff(before as any, after as any),
  });
  res.json(after);
});

router.post("/:id/submit", async (req, res) => {
  const before = await db.get<Application>(APPLICATIONS_TABLE, {
    id: req.params.id,
  });
  if (!before) return res.status(404).json({ error: "Not found" });
  if (before.status !== "DRAFT") {
    return res
      .status(400)
      .json({ error: "Only DRAFT applications can be submitted" });
  }

  const after = await db.update<Application>(
    APPLICATIONS_TABLE,
    { id: req.params.id },
    { status: "PENDING_APPROVAL", updatedAt: nowIso() }
  );
  await logAudit({
    entityType: "Application",
    entityId: req.params.id,
    action: "UPDATE",
    actorUserId: (req as any).user?.sub || "system",
    details: { status: "PENDING_APPROVAL" },
  });
  res.json(after);
});

router.post("/:id/decide", async (req, res) => {
  const parsed = z
    .object({
      role: z.string().min(2),
      decision: z.enum(["APPROVED", "REJECTED"]),
      statusText: z.string().max(1024).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: parsed.error.format() });
  }
  const { role, decision, statusText } = parsed.data;

  const appItem = await db.get<Application>(APPLICATIONS_TABLE, {
    id: req.params.id,
  });
  if (!appItem) return res.status(404).json({ error: "Not found" });
  if (appItem.status !== "PENDING_APPROVAL") {
    return res.status(400).json({ error: "Application is not pending" });
  }

  const steps = [...(appItem.approvalSteps || [])];
  const idx = steps.findIndex(
    (s) => s.role === role && s.status === "PENDING_APPROVAL"
  );
  if (idx === -1) {
    return res.status(400).json({ error: "No pending step for this role" });
  }

  steps[idx] = {
    ...steps[idx],
    status: decision,
    statusText: statusText || "",
    updatedAt: nowIso(), // <-- allowed by shared schema now
  };

  let newStatus: ApplicationStatus = appItem.status;
  if (decision === "REJECTED") newStatus = "REJECTED";
  else {
    const anyPending = steps.some((s) => s.status === "PENDING_APPROVAL");
    const anyRejected = steps.some((s) => s.status === "REJECTED");
    if (anyRejected) newStatus = "REJECTED";
    else if (!anyPending) newStatus = "APPROVED";
  }

  const updated = await db.update<Application>(
    APPLICATIONS_TABLE,
    { id: req.params.id },
    { approvalSteps: steps, status: newStatus, updatedAt: nowIso() }
  );

  await logAudit({
    entityType: "Application",
    entityId: req.params.id,
    action: decision === "APPROVED" ? "APPROVE" : "REJECT",
    actorUserId: (req as any).user?.sub || "system",
    details: { stepRole: role, status: decision },
  });

  try {
    const user = await db.get<{ email?: string; firstName?: string }>(
      USERS_TABLE,
      { id: appItem.userId }
    );
    const email = user?.email;
    if (email) {
      await sendEmail({
        to: email,
        subject: `Your application ${req.params.id} is ${newStatus}`,
        body: `<p>Hello${user?.firstName ? " " + user.firstName : ""},</p>
               <p>Your application <strong>${req.params.id}</strong> is now <strong>${newStatus}</strong>.</p>`,
      });
    }
  } catch (e) {
    console.error("Email notify failed", e);
  }

  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  await db.delete(APPLICATIONS_TABLE, { id: req.params.id });
  await logAudit({
    entityType: "Application",
    entityId: req.params.id,
    action: "DELETE",
    actorUserId: (req as any).user?.sub || "system",
    details: {},
  });
  res.json({ ok: true });
});

export default router;
