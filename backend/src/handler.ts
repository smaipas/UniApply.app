// src/handler.ts
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  PostConfirmationTriggerHandler,
} from "aws-lambda";
import { randomUUID } from "crypto";
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  DescribeTableCommand,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

import { jsonParse, validate, response } from "./validation/http";
import {
  UserCreateSchema,
  UserUpdateSchema,
  FormTemplateCreateSchema,
  FormTemplateUpdateSchema,
  ApplicationCreateSchema,
  ApplicationUpdateSchema,
  AppStatus,
  type ApplicationUpdate,
  PresignUploadSchema,
  RoleSchema,
} from "@uniapply/shared";

// ------------ AWS clients ------------
const ddb = new DynamoDBClient({ region: process.env.REGION });
const s3 = new S3Client({ region: process.env.REGION });
const ses = new SESv2Client({ region: process.env.REGION });

// ------------ ENV ------------
const USERS_TABLE = process.env.USERS_TABLE!;
const FORMS_TABLE = process.env.FORMS_TABLE!;
const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE!;
const AUDIT_TABLE = process.env.AUDIT_TABLE!;
const UPLOADS_BUCKET = process.env.UPLOADS_BUCKET!;
const SES_SENDER_EMAIL = process.env.SES_SENDER_EMAIL!;

// ------------ Helpers ------------
function getMethodPath(event: APIGatewayProxyEventV2) {
  const method = event.requestContext?.http?.method || "GET";
  const path = event.requestContext?.http?.path || event.rawPath || "";
  return { method, path };
}

function getPathParam(path: string, prefix: string): string | null {
  const rx = new RegExp(`^${prefix}([^/]+)$`);
  const m = path.match(rx);
  return m ? decodeURIComponent(m[1]) : null;
}

function requesterSub(event: APIGatewayProxyEventV2): string | null {
  const claims = (event.requestContext as any)?.authorizer?.jwt?.claims;
  return (claims?.sub as string) || null;
}

function nowIso() {
  return new Date().toISOString();
}

// ------------- Application field validation helpers -------------
function toNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function toString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return null;
}
function getFileExt(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)(?:\?|#|$)/);
  return m ? m[1] : "";
}
type FieldRule = { rule: string; value?: unknown };
function findRule(
  rules: FieldRule[] | undefined,
  name: string
): FieldRule | undefined {
  return (Array.isArray(rules) ? rules : []).find((r) => r?.rule === name);
}

// Build DynamoDB UpdateExpression safely from a partial DTO
function buildUpdateExpr(obj: Record<string, unknown>) {
  const names: Record<string, string> = {};
  const values: Record<string, unknown> = {};
  const sets: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "undefined") continue;
    const nk = `#${k.replace(/[^A-Za-z0-9]/g, "_")}`;
    const vk = `:${k.replace(/[^A-Za-z0-9]/g, "_")}`;
    names[nk] = k;
    values[vk] = v;
    sets.push(`${nk} = ${vk}`);
  }
  if (sets.length === 0) return null;
  return {
    UpdateExpression: `SET ${sets.join(", ")}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: marshall(values, {
      removeUndefinedValues: true,
    }),
  };
}

// Minimal diff generator for audit logs
function diff(
  oldObj: Record<string, unknown> | null,
  newObj: Record<string, unknown>
) {
  const out: Record<string, { from: unknown; to: unknown }> = {};
  const keys = new Set([
    ...Object.keys(oldObj || {}),
    ...Object.keys(newObj || {}),
  ]);
  for (const k of keys) {
    const a = (oldObj || {})[k];
    const b = newObj[k];
    if (JSON.stringify(a) !== JSON.stringify(b)) out[k] = { from: a, to: b };
  }
  return out;
}

// Write minimal audit log
async function writeAudit(
  entity: "USER" | "FORM_TEMPLATE" | "APPLICATION",
  entityId: string,
  actorUserId: string,
  action: string,
  changed?: Record<string, unknown>
) {
  const item = {
    id: randomUUID(),
    entity,
    entityId,
    actorUserId,
    action,
    changed: changed && Object.keys(changed).length ? changed : undefined,
    createdAt: nowIso(),
  };
  await ddb.send(
    new PutItemCommand({
      TableName: AUDIT_TABLE,
      Item: marshall(item, { removeUndefinedValues: true }),
    })
  );
}

// Seed roles table with USER and ADMIN if missing
async function seedDefaultRoles() {
  try {
    await ddb.send(
      new DescribeTableCommand({ TableName: process.env.ROLES_TABLE! })
    );
  } catch {
    return;
  }
  const now = nowIso();
  const roles = [
    {
      roleName: "USER",
      roleLabel: "User",
      access: {
        applications: {
          create: true,
          update: false,
          delete: false,
          approve: false,
          reject: false,
          readAll: false,
          readOwn: true,
        },
        formTemplates: {
          create: false,
          readAll: false,
          readActive: true,
          update: false,
          delete: false,
        },
        users: {
          create: false,
          readAll: false,
          update: false,
          delete: false,
        },
        auditLogs: {
          read: false,
        },
        systemSettings: {
          read: false,
          update: false,
        },
        roles: {
          readAll: false,
          create: false,
          update: false,
          delete: false,
        },
      },
    },
    {
      roleName: "ADMIN",
      roleLabel: "Administrator",
      access: {
        applications: {
          create: true,
          update: true,
          delete: true,
          approve: true,
          reject: true,
          readAll: true,
          readOwn: true,
        },
        formTemplates: {
          create: true,
          readAll: true,
          readActive: true,
          update: true,
          delete: true,
        },
        users: {
          create: true,
          readAll: true,
          update: true,
          delete: true,
        },
        auditLogs: {
          read: true,
        },
        systemSettings: {
          read: true,
          update: true,
        },
        roles: {
          readAll: true,
          create: true,
          update: true,
          delete: true,
        },
      },
    },
  ];

  for (const r of roles) {
    try {
      const valid = validate(RoleSchema, r);
      await ddb.send(
        new PutItemCommand({
          TableName: process.env.ROLES_TABLE!,
          Item: marshall(
            { ...valid, createdAt: now, updatedAt: now },
            { removeUndefinedValues: true }
          ),
          ConditionExpression: "attribute_not_exists(roleName)",
        })
      );
      await writeAudit(
        "USER",
        valid.roleName,
        "system",
        "CREATE",
        valid as any
      );
    } catch (e: any) {
      if (e?.name !== "ConditionalCheckFailedException") {
        console.warn("seedDefaultRoles", r.roleName, e?.message || e);
      }
    }
  }
}

// ------------ Users ------------
async function createUser(event: APIGatewayProxyEventV2) {
  const body = jsonParse(event.body);
  const MinimalUser = UserCreateSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
  });
  const dto = validate(MinimalUser, body);

  const sub = requesterSub(event) || randomUUID();
  const now = nowIso();
  const item = {
    id: sub,
    role: "USER",
    ...dto,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await ddb.send(
      new PutItemCommand({
        TableName: USERS_TABLE,
        Item: marshall(item, { removeUndefinedValues: true }),
        ConditionExpression: "attribute_not_exists(id)",
      })
    );
    await writeAudit(
      "USER",
      sub,
      requesterSub(event) || "system",
      "CREATE",
      dto
    );
    return response(201, { id: sub, ...dto });
  } catch (e: any) {
    // If user already exists, treat as idempotent success
    if (e?.name === "ConditionalCheckFailedException") {
      return response(200, { id: sub, ...dto, existed: true });
    }
    throw e;
  }
}

async function updateUser(event: APIGatewayProxyEventV2, id: string) {
  const body = jsonParse(event.body);
  const dto = validate(UserUpdateSchema, body);

  // Authorization: only owner or users whose role has canModifyUserData
  const viewerSub = requesterSub(event);
  if (!viewerSub) return response(403, { message: "Forbidden" });
  if (viewerSub === id) {
    // self-update cannot change role
    if (Object.prototype.hasOwnProperty.call(dto, "role")) {
      return response(403, { message: "Cannot change own role" });
    }
  } else {
    // Load viewer role
    const viewerRes = await ddb.send(
      new GetItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: viewerSub }),
      })
    );
    const viewer = viewerRes.Item ? (unmarshall(viewerRes.Item) as any) : null;
    const roleName = viewer?.role as string | undefined;
    if (!roleName) return response(403, { message: "Forbidden" });
    const roleRes = await ddb.send(
      new GetItemCommand({
        TableName: process.env.ROLES_TABLE!,
        Key: marshall({ roleName }),
      })
    );
    const role = roleRes.Item ? (unmarshall(roleRes.Item) as any) : null;
    const canModifyUsers = !!role?.access?.canModifyUserData;
    if (!canModifyUsers) return response(403, { message: "Forbidden" });
  }

  const prevRes = await ddb.send(
    new GetItemCommand({ TableName: USERS_TABLE, Key: marshall({ id }) })
  );
  const prev = prevRes.Item ? unmarshall(prevRes.Item) : null;
  if (!prev) return response(404, { message: "User not found" });

  const patch = { ...dto, updatedAt: nowIso() };
  const expr = buildUpdateExpr(patch);
  if (!expr) return response(400, { message: "No valid fields to update" });

  await ddb.send(
    new UpdateItemCommand({
      TableName: USERS_TABLE,
      Key: marshall({ id }),
      ...expr,
      ReturnValues: "ALL_NEW",
    })
  );

  await writeAudit(
    "USER",
    id,
    requesterSub(event) || "system",
    "UPDATE",
    diff(prev as Record<string, unknown>, { ...(prev as any), ...patch })
  );
  return response(200, { ok: true });
}

async function getUser(event: APIGatewayProxyEventV2, id: string) {
  const res = await ddb.send(
    new GetItemCommand({ TableName: USERS_TABLE, Key: marshall({ id }) })
  );
  if (!res.Item) return response(404, { message: "User not found" });
  const user = unmarshall(res.Item) as any;

  // Attach access permissions derived from the user's role
  const roleName = user?.role as string | undefined;
  let access: Record<string, boolean> | undefined = undefined;
  if (roleName) {
    const roleRes = await ddb.send(
      new GetItemCommand({
        TableName: process.env.ROLES_TABLE!,
        Key: marshall({ roleName }),
      })
    );
    const role = roleRes.Item ? (unmarshall(roleRes.Item) as any) : null;
    access = role?.access as Record<string, boolean> | undefined;
  }

  // Only the subject or an admin may see full profile fields; others get limited fields
  const viewerSub = requesterSub(event);
  if (viewerSub !== id) {
    // Check if viewer is admin (has canViewAllUsers)
    if (!viewerSub) return response(403, { message: "Forbidden" });
    const vRes = await ddb.send(
      new GetItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: viewerSub }),
      })
    );
    const viewer = vRes.Item ? (unmarshall(vRes.Item) as any) : null;
    const viewerRole = viewer?.role as string | undefined;
    if (!viewerRole) return response(403, { message: "Forbidden" });
    const vRoleRes = await ddb.send(
      new GetItemCommand({
        TableName: process.env.ROLES_TABLE!,
        Key: marshall({ roleName: viewerRole }),
      })
    );
    const vRole = vRoleRes.Item ? (unmarshall(vRoleRes.Item) as any) : null;
    const canViewAllUsers = !!vRole?.access?.canViewAllUsers;
    if (!canViewAllUsers) return response(403, { message: "Forbidden" });
  }

  return response(200, { ...user, access });
}

async function listUsers(event: APIGatewayProxyEventV2) {
  // Only roles with canViewAllUsers can view all users
  const viewerSub = requesterSub(event);
  if (!viewerSub) return response(403, { message: "Forbidden" });
  const viewerRes = await ddb.send(
    new GetItemCommand({
      TableName: USERS_TABLE,
      Key: marshall({ id: viewerSub }),
    })
  );
  const viewer = viewerRes.Item ? (unmarshall(viewerRes.Item) as any) : null;
  const roleName = viewer?.role as string | undefined;
  if (!roleName) return response(403, { message: "Forbidden" });
  const roleRes = await ddb.send(
    new GetItemCommand({
      TableName: process.env.ROLES_TABLE!,
      Key: marshall({ roleName }),
    })
  );
  const role = roleRes.Item ? (unmarshall(roleRes.Item) as any) : null;
  if (!role?.access?.canViewAllUsers)
    return response(403, { message: "Forbidden" });

  const out = await ddb.send(new ScanCommand({ TableName: USERS_TABLE }));
  const items = (out.Items || []).map((it: any) => unmarshall(it));
  return response(200, items);
}

// ------------ Forms ------------
async function createForm(event: APIGatewayProxyEventV2) {
  const body = jsonParse(event.body);
  const dto = validate(FormTemplateCreateSchema, body);

  // Authorization: require canCreateFormTemplates
  const viewerSub = requesterSub(event);
  if (!viewerSub) return response(403, { message: "Forbidden" });
  const viewerRes = await ddb.send(
    new GetItemCommand({
      TableName: USERS_TABLE,
      Key: marshall({ id: viewerSub }),
    })
  );
  const viewer = viewerRes.Item ? (unmarshall(viewerRes.Item) as any) : null;
  const roleName = viewer?.role as string | undefined;
  if (!roleName) return response(403, { message: "Forbidden" });
  const roleRes = await ddb.send(
    new GetItemCommand({
      TableName: process.env.ROLES_TABLE!,
      Key: marshall({ roleName }),
    })
  );
  const role = roleRes.Item ? (unmarshall(roleRes.Item) as any) : null;
  if (!role?.access?.formTemplates?.create)
    return response(403, { message: "Forbidden" });

  const id = randomUUID();
  const item = {
    id,
    ...dto,
    version: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  await ddb.send(
    new PutItemCommand({
      TableName: FORMS_TABLE,
      Item: marshall(item, { removeUndefinedValues: true }),
    })
  );

  await writeAudit(
    "FORM_TEMPLATE",
    id,
    requesterSub(event) || "system",
    "CREATE",
    dto
  );
  return response(201, { id, ...dto });
}

async function updateForm(event: APIGatewayProxyEventV2, id: string) {
  const body = jsonParse(event.body);
  const dto = validate(FormTemplateUpdateSchema, body);

  // Authorization: require canModifyFormTemplates
  const viewerSub = requesterSub(event);
  if (!viewerSub) return response(403, { message: "Forbidden" });
  const viewerRes = await ddb.send(
    new GetItemCommand({
      TableName: USERS_TABLE,
      Key: marshall({ id: viewerSub }),
    })
  );
  const viewer = viewerRes.Item ? (unmarshall(viewerRes.Item) as any) : null;
  const roleName = viewer?.role as string | undefined;
  if (!roleName) return response(403, { message: "Forbidden" });
  const roleRes = await ddb.send(
    new GetItemCommand({
      TableName: process.env.ROLES_TABLE!,
      Key: marshall({ roleName }),
    })
  );
  const role = roleRes.Item ? (unmarshall(roleRes.Item) as any) : null;
  if (!role?.access?.formTemplates?.update)
    return response(403, { message: "Forbidden" });

  const prevRes = await ddb.send(
    new GetItemCommand({ TableName: FORMS_TABLE, Key: marshall({ id }) })
  );
  const prev = prevRes.Item ? unmarshall(prevRes.Item) : null;
  if (!prev) return response(404, { message: "Form not found" });

  const patch = {
    ...dto,
    version: (prev.version || 1) + 1,
    updatedAt: nowIso(),
  };
  const expr = buildUpdateExpr(patch);
  if (!expr) return response(400, { message: "No valid fields to update" });

  await ddb.send(
    new UpdateItemCommand({
      TableName: FORMS_TABLE,
      Key: marshall({ id }),
      ...expr,
    })
  );

  await writeAudit(
    "FORM_TEMPLATE",
    id,
    requesterSub(event) || "system",
    "UPDATE",
    diff(prev as Record<string, unknown>, { ...(prev as any), ...patch })
  );
  return response(200, { ok: true });
}

async function deleteForm(event: APIGatewayProxyEventV2, id: string) {
  // Authorization: require canModifyFormTemplates
  const viewerSub = requesterSub(event);
  if (!viewerSub) return response(403, { message: "Forbidden" });
  const viewerRes = await ddb.send(
    new GetItemCommand({
      TableName: USERS_TABLE,
      Key: marshall({ id: viewerSub }),
    })
  );
  const viewer = viewerRes.Item ? (unmarshall(viewerRes.Item) as any) : null;
  const roleName = viewer?.role as string | undefined;
  if (!roleName) return response(403, { message: "Forbidden" });
  const roleRes = await ddb.send(
    new GetItemCommand({
      TableName: process.env.ROLES_TABLE!,
      Key: marshall({ roleName }),
    })
  );
  const role = roleRes.Item ? (unmarshall(roleRes.Item) as any) : null;
  if (!role?.access?.formTemplates?.delete)
    return response(403, { message: "Forbidden" });

  // Check if form exists
  const formRes = await ddb.send(
    new GetItemCommand({ TableName: FORMS_TABLE, Key: marshall({ id }) })
  );
  const form = formRes.Item ? (unmarshall(formRes.Item) as any) : null;
  if (!form) return response(404, { message: "Form not found" });

  // Check if there are any applications using this form
  const appsRes = await ddb.send(
    new ScanCommand({
      TableName: APPLICATIONS_TABLE,
      FilterExpression: "formId = :formId",
      ExpressionAttributeValues: marshall({ ":formId": id }),
      Limit: 1,
    })
  );

  if (appsRes.Items && appsRes.Items.length > 0) {
    return response(400, {
      message:
        "Cannot delete form template that has applications. Please delete all applications first.",
    });
  }

  await ddb.send(
    new DeleteItemCommand({
      TableName: FORMS_TABLE,
      Key: marshall({ id }),
    })
  );

  await writeAudit(
    "FORM_TEMPLATE",
    id,
    requesterSub(event) || "system",
    "DELETE",
    form
  );
  return response(200, { ok: true });
}

async function getForm(_event: APIGatewayProxyEventV2, id: string) {
  const res = await ddb.send(
    new GetItemCommand({ TableName: FORMS_TABLE, Key: marshall({ id }) })
  );
  if (!res.Item) return response(404, { message: "Form not found" });
  const form = unmarshall(res.Item) as any;

  // Authorization for visibility: allow if role can view all or if form is active and viewer's role is in visibleToRoles
  const viewerSub = (_event && requesterSub(_event)) || null;
  if (!viewerSub) return response(403, { message: "Forbidden" });

  const viewerRes = await ddb.send(
    new GetItemCommand({
      TableName: USERS_TABLE,
      Key: marshall({ id: viewerSub }),
    })
  );
  const viewer = viewerRes.Item ? (unmarshall(viewerRes.Item) as any) : null;
  const roleName = viewer?.role as string | undefined;
  if (!roleName) return response(403, { message: "Forbidden" });

  const roleRes = await ddb.send(
    new GetItemCommand({
      TableName: process.env.ROLES_TABLE!,
      Key: marshall({ roleName }),
    })
  );
  const role = roleRes.Item ? (unmarshall(roleRes.Item) as any) : null;
  const canViewAll = !!role?.access?.formTemplates?.readAll;
  const canViewActive = !!role?.access?.formTemplates?.readActive;
  const listed = Array.isArray(form.visibleToRoles) ? form.visibleToRoles : [];
  if (
    !canViewAll &&
    !(canViewActive && form.active && listed.includes(roleName))
  ) {
    return response(403, { message: "Forbidden" });
  }
  return response(200, form);
}

// ------------ Applications ------------
async function createApplication(event: APIGatewayProxyEventV2) {
  const body = jsonParse(event.body);
  const dto = validate(ApplicationCreateSchema, body);

  // Authorization: only creator with canCreateApplications can create
  const viewerSub = requesterSub(event);
  if (!viewerSub) return response(403, { message: "Forbidden" });
  if (dto.userId !== viewerSub) return response(403, { message: "Forbidden" });
  const viewerRes = await ddb.send(
    new GetItemCommand({
      TableName: USERS_TABLE,
      Key: marshall({ id: viewerSub }),
    })
  );
  const viewer = viewerRes.Item ? (unmarshall(viewerRes.Item) as any) : null;
  const roleName = viewer?.role as string | undefined;
  if (!roleName) return response(403, { message: "Forbidden" });
  const roleRes = await ddb.send(
    new GetItemCommand({
      TableName: process.env.ROLES_TABLE!,
      Key: marshall({ roleName }),
    })
  );
  const role = roleRes.Item ? (unmarshall(roleRes.Item) as any) : null;
  if (!role?.access?.applications?.create)
    return response(403, { message: "Forbidden" });

  // Load form template to validate fields against rules
  const formRes = await ddb.send(
    new GetItemCommand({
      TableName: FORMS_TABLE,
      Key: marshall({ id: dto.formId }),
    })
  );
  const form = formRes.Item ? (unmarshall(formRes.Item) as any) : null;
  if (!form) return response(400, { message: "Invalid formId" });

  const errors: Array<{ field: string; message: string }> = [];
  const fieldDefs: Array<any> = Array.isArray(form.fields) ? form.fields : [];
  const data: Record<string, unknown> = (dto.fields || {}) as any;
  for (const def of fieldDefs) {
    const name = String(def?.name || "");
    if (!name) continue;
    const rules = (def?.validationRules as FieldRule[]) || [];
    const required = !!findRule(rules, "required");
    const minRule = findRule(rules, "min");
    const maxRule = findRule(rules, "max");
    const enumRule = findRule(rules, "enum");
    const v = data[name];

    // Required
    if (required && (typeof v === "undefined" || v === null || v === "")) {
      errors.push({ field: name, message: "is required" });
      continue;
    }
    if (typeof v === "undefined" || v === null || v === "") continue; // nothing else to validate

    const t = String(def?.inputType || "TEXT");
    if (t === "TEXT" || t === "LONG_TEXT") {
      const s = toString(v);
      if (s === null) {
        errors.push({ field: name, message: "must be a string" });
        continue;
      }
      const min =
        typeof minRule?.value === "number"
          ? (minRule!.value as number)
          : toNumber(minRule?.value);
      const max =
        typeof maxRule?.value === "number"
          ? (maxRule!.value as number)
          : toNumber(maxRule?.value);
      if (typeof min === "number" && s.length < min)
        errors.push({ field: name, message: `min ${min} chars` });
      if (typeof max === "number" && s.length > max)
        errors.push({ field: name, message: `max ${max} chars` });
    } else if (t === "NUMBER") {
      const n = toNumber(v);
      if (n === null) {
        errors.push({ field: name, message: "must be a number" });
        continue;
      }
      const min =
        typeof minRule?.value === "number"
          ? (minRule!.value as number)
          : toNumber(minRule?.value);
      const max =
        typeof maxRule?.value === "number"
          ? (maxRule!.value as number)
          : toNumber(maxRule?.value);
      if (typeof min === "number" && n < min)
        errors.push({ field: name, message: `min ${min}` });
      if (typeof max === "number" && n > max)
        errors.push({ field: name, message: `max ${max}` });
    } else if (t === "FILE") {
      const allowed = Array.isArray(enumRule?.value)
        ? (enumRule!.value as unknown[]).map((x) => String(x))
        : [];
      const s = toString(v);
      if (!s) {
        errors.push({ field: name, message: "must be a file key or name" });
      } else if (allowed.length) {
        const ext = getFileExt(s);
        if (!allowed.includes(ext))
          errors.push({
            field: name,
            message: `unsupported file type .${ext}`,
          });
      }
    } else if (t === "DATE") {
      const s = toString(v);
      if (!s) {
        errors.push({ field: name, message: "must be a date (YYYY-MM-DD)" });
      } else {
        const min =
          typeof minRule?.value === "string"
            ? (minRule!.value as string)
            : null;
        const max =
          typeof maxRule?.value === "string"
            ? (maxRule!.value as string)
            : null;
        if (min && s < min)
          errors.push({ field: name, message: `date must be >= ${min}` });
        if (max && s > max)
          errors.push({ field: name, message: `date must be <= ${max}` });
      }
    }
  }

  if (errors.length)
    return response(400, { message: "Validation failed", errors });

  const id = randomUUID();
  const item = {
    id,
    userId: dto.userId,
    formId: dto.formId,
    formVersion: form.version || 1,
    fields: dto.fields,
    approvalSteps: dto.approvalSteps,
    status: AppStatus.enum.DRAFT, // enforce DRAFT at creation
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  await ddb.send(
    new PutItemCommand({
      TableName: APPLICATIONS_TABLE,
      Item: marshall(item, { removeUndefinedValues: true }),
    })
  );

  await writeAudit(
    "APPLICATION",
    id,
    requesterSub(event) || dto.userId,
    "CREATE",
    item as Record<string, unknown>
  );
  return response(201, item);
}

async function updateApplication(event: APIGatewayProxyEventV2, id: string) {
  const body = jsonParse(event.body);
  const dto = validate(ApplicationUpdateSchema, body);

  const viewerSub = requesterSub(event);
  if (!viewerSub) return response(403, { message: "Forbidden" });

  // Status must be updated via dedicated endpoint
  if (typeof dto.status !== "undefined") {
    return response(400, {
      message: "Use /applications/{id}/status to update status",
    });
  }

  const prevRes = await ddb.send(
    new GetItemCommand({ TableName: APPLICATIONS_TABLE, Key: marshall({ id }) })
  );
  const prev = prevRes.Item ? (unmarshall(prevRes.Item) as any) : null;
  if (!prev) return response(404, { message: "Application not found" });

  // Data updates allowed by owner when DRAFT; otherwise require canModifyApplicationSettings
  if (!(viewerSub === prev.userId && prev.status === "DRAFT")) {
    const vRes = await ddb.send(
      new GetItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: viewerSub }),
      })
    );
    const viewer = vRes.Item ? (unmarshall(vRes.Item) as any) : null;
    const roleName = viewer?.role as string | undefined;
    if (!roleName) return response(403, { message: "Forbidden" });
    const roleRes = await ddb.send(
      new GetItemCommand({
        TableName: process.env.ROLES_TABLE!,
        Key: marshall({ roleName }),
      })
    );
    const role = roleRes.Item ? (unmarshall(roleRes.Item) as any) : null;
    if (!role?.access?.canModifyApplicationSettings) {
      return response(403, { message: "Forbidden" });
    }
  }

  const patch: ApplicationUpdate & { updatedAt?: string } = {
    ...dto,
    updatedAt: nowIso(),
  };

  const expr = buildUpdateExpr(patch as Record<string, unknown>);
  if (!expr) return response(400, { message: "No valid fields to update" });

  const res = await ddb.send(
    new UpdateItemCommand({
      TableName: APPLICATIONS_TABLE,
      Key: marshall({ id }),
      ...expr,
      ReturnValues: "ALL_NEW",
    })
  );

  const next = res.Attributes
    ? (unmarshall(res.Attributes) as any)
    : { id, ...prev, ...patch };

  await writeAudit(
    "APPLICATION",
    id,
    requesterSub(event) || prev.userId,
    "UPDATE",
    diff(prev, next)
  );

  return response(200, { ok: true });
}

async function getApplication(event: APIGatewayProxyEventV2, id: string) {
  const res = await ddb.send(
    new GetItemCommand({ TableName: APPLICATIONS_TABLE, Key: marshall({ id }) })
  );
  if (!res.Item) return response(404, { message: "Application not found" });
  const application = unmarshall(res.Item) as any;

  // Authorization: only owner or users whose role has canViewAllApplications
  const viewerSub = requesterSub(event);
  if (!viewerSub) return response(403, { message: "Forbidden" });
  if (application.userId === viewerSub) return response(200, application);

  // Load viewer role
  const viewerRes = await ddb.send(
    new GetItemCommand({
      TableName: USERS_TABLE,
      Key: marshall({ id: viewerSub }),
    })
  );
  const viewer = viewerRes.Item ? (unmarshall(viewerRes.Item) as any) : null;
  const roleName = viewer?.role as string | undefined;
  if (!roleName) return response(403, { message: "Forbidden" });

  const roleRes = await ddb.send(
    new GetItemCommand({
      TableName: process.env.ROLES_TABLE!,
      Key: marshall({ roleName }),
    })
  );
  const role = roleRes.Item ? (unmarshall(roleRes.Item) as any) : null;
  const canViewAll = !!role?.access?.applications?.readAll;
  if (!canViewAll) return response(403, { message: "Forbidden" });
  return response(200, application);
}

// Strict status update with sequential approval and role matching
async function updateApplicationStatus(
  event: APIGatewayProxyEventV2,
  id: string
) {
  const body = jsonParse<{ status?: string }>(event.body);
  const requested = (body?.status || "").toUpperCase();
  if (requested !== "APPROVED" && requested !== "REJECTED") {
    return response(400, { message: "status must be APPROVED or REJECTED" });
  }

  const viewerSub = requesterSub(event);
  if (!viewerSub) return response(403, { message: "Forbidden" });

  const prevRes = await ddb.send(
    new GetItemCommand({ TableName: APPLICATIONS_TABLE, Key: marshall({ id }) })
  );
  const app = prevRes.Item ? (unmarshall(prevRes.Item) as any) : null;
  if (!app) return response(404, { message: "Application not found" });

  const steps = Array.isArray(app.approvalSteps)
    ? app.approvalSteps.slice()
    : [];
  const firstPendingIdx = steps.findIndex(
    (s: any) => s?.status === "PENDING_APPROVAL"
  );
  if (firstPendingIdx === -1)
    return response(400, { message: "No pending approval step" });

  // Load viewer role
  const viewerRes = await ddb.send(
    new GetItemCommand({
      TableName: USERS_TABLE,
      Key: marshall({ id: viewerSub }),
    })
  );
  const viewer = viewerRes.Item ? (unmarshall(viewerRes.Item) as any) : null;
  const roleName = (viewer?.role as string | undefined) || "";
  if (!roleName) return response(403, { message: "Forbidden" });

  // Also require canApproveForms permission
  const roleRes = await ddb.send(
    new GetItemCommand({
      TableName: process.env.ROLES_TABLE!,
      Key: marshall({ roleName }),
    })
  );
  const role = roleRes.Item ? (unmarshall(roleRes.Item) as any) : null;
  if (!role?.access?.applications?.approve)
    return response(403, { message: "Forbidden" });

  const pendingStep = steps[firstPendingIdx];
  if ((pendingStep?.role || "").toUpperCase() !== roleName.toUpperCase()) {
    return response(403, { message: "Forbidden" });
  }

  // Update the first pending step
  steps[firstPendingIdx] = {
    ...pendingStep,
    status: requested,
    updatedAt: nowIso(),
    updatedByEmail: viewer?.email || undefined,
  };

  // Compute overall application status
  let nextStatus = app.status as string;
  if (requested === "REJECTED") nextStatus = "REJECTED";
  else {
    const remainingPending = steps.findIndex(
      (s: any) => s?.status === "PENDING_APPROVAL"
    );
    nextStatus = remainingPending === -1 ? "APPROVED" : "PENDING_APPROVAL";
  }

  const patch = {
    approvalSteps: steps,
    status: nextStatus,
    updatedAt: nowIso(),
  };
  const expr = buildUpdateExpr(patch as Record<string, unknown>);
  if (!expr) return response(400, { message: "No valid fields to update" });

  await ddb.send(
    new UpdateItemCommand({
      TableName: APPLICATIONS_TABLE,
      Key: marshall({ id }),
      ...expr,
    })
  );

  await writeAudit("APPLICATION", id, viewerSub, "UPDATE_STATUS", {
    stepIndex: firstPendingIdx,
    status: requested,
    appStatus: nextStatus,
  });

  if (nextStatus === "APPROVED" || nextStatus === "REJECTED") {
    await tryNotifyApplicantDecision(app.userId, id, nextStatus);
  }

  return response(200, { ok: true, status: nextStatus });
}

// ------------ SES notifications ------------
async function tryNotifyApplicantDecision(
  userId: string,
  applicationId: string,
  status: "APPROVED" | "REJECTED"
) {
  try {
    const u = await ddb.send(
      new GetItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: userId }),
      })
    );
    const user = u.Item ? (unmarshall(u.Item) as any) : null;
    if (!user?.email) return;

    const subject = `Your application ${applicationId} was ${status}`;
    const body = `Hello ${user.firstName ?? ""},

Your application (${applicationId}) has been ${status.toLowerCase()}

Regards,
UniApply`;

    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: SES_SENDER_EMAIL,
        Destination: { ToAddresses: [user.email] },
        Content: {
          Simple: {
            Subject: { Data: subject },
            Body: { Text: { Data: body } },
          },
        },
      })
    );
  } catch (e) {
    console.error("notify error", e);
  }
}

// ------------ Upload presign (validated) ------------
export const presignUpload: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const raw = jsonParse(event.body);
    const { contentType } = validate(PresignUploadSchema, raw);

    const ct = contentType ?? "application/octet-stream";
    const ext = ct.includes("png")
      ? "png"
      : ct.includes("jpeg")
        ? "jpg"
        : ct.includes("jpg")
          ? "jpg"
          : ct.includes("pdf")
            ? "pdf"
            : "bin";

    const key = `uploads/${randomUUID()}.${ext}`;
    const cmd = new PutObjectCommand({
      Bucket: UPLOADS_BUCKET,
      Key: key,
      ContentType: ct,
    });
    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 });
    return response(200, { uploadUrl, key });
  } catch (err: any) {
    if (err?.statusCode === 400)
      return response(400, {
        message: err.message,
        details: err.details ?? [],
      });
    console.error(err);
    return response(500, { message: "Internal Server Error" });
  }
};

// ------------ Main router ------------
export const main: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const { method, path } = getMethodPath(event);

    // Seed default roles on cold start (idempotent)
    await seedDefaultRoles();

    // Handle preflight CORS if it ever reaches integration
    if (method === "OPTIONS") {
      const origin =
        (event.headers?.origin as string) ||
        (event.headers?.Origin as string) ||
        "*";
      const reqHeaders =
        (event.headers?.["access-control-request-headers"] as string) ||
        (event.headers?.["Access-Control-Request-Headers"] as string) ||
        "Authorization, Content-Type";
      return {
        statusCode: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": reqHeaders,
          "Access-Control-Max-Age": "86400",
        },
        body: "",
      };
    }

    // Roles
    if (method === "GET" && path === "/roles") {
      let out = await ddb.send(
        new ScanCommand({ TableName: process.env.ROLES_TABLE! })
      );
      let items = (out.Items || []).map((it: any) => unmarshall(it));
      if (!items.length) {
        await seedDefaultRoles();
        out = await ddb.send(
          new ScanCommand({ TableName: process.env.ROLES_TABLE! })
        );
        items = (out.Items || []).map((it: any) => unmarshall(it));
      }
      // Hide access unless viewer has canModifyUserRoleAccess
      const viewerSub = requesterSub(event);
      let canModifyRoleAccess = false;
      if (viewerSub) {
        const vRes = await ddb.send(
          new GetItemCommand({
            TableName: USERS_TABLE,
            Key: marshall({ id: viewerSub }),
          })
        );
        const viewer = vRes.Item ? (unmarshall(vRes.Item) as any) : null;
        const viewerRole = viewer?.role as string | undefined;
        if (viewerRole) {
          const vRoleRes = await ddb.send(
            new GetItemCommand({
              TableName: process.env.ROLES_TABLE!,
              Key: marshall({ roleName: viewerRole }),
            })
          );
          const vRole = vRoleRes.Item
            ? (unmarshall(vRoleRes.Item) as any)
            : null;
          canModifyRoleAccess = !!vRole?.access?.roles?.update;
        }
      }
      const sanitized = canModifyRoleAccess
        ? items
        : items.map((r: any) => ({ roleName: r.roleName }));
      return response(200, sanitized);
    }
    {
      const roleName = getPathParam(path, "/roles/");
      if (roleName && method === "GET") {
        const res = await ddb.send(
          new GetItemCommand({
            TableName: process.env.ROLES_TABLE!,
            Key: marshall({ roleName }),
          })
        );
        if (!res.Item) return response(404, { message: "Role not found" });
        const role = unmarshall(res.Item) as any;
        // Hide access unless viewer has canModifyUserRoleAccess
        const viewerSub = requesterSub(event);
        if (viewerSub) {
          const vRes = await ddb.send(
            new GetItemCommand({
              TableName: USERS_TABLE,
              Key: marshall({ id: viewerSub }),
            })
          );
          const viewer = vRes.Item ? (unmarshall(vRes.Item) as any) : null;
          const viewerRole = viewer?.role as string | undefined;
          if (viewerRole) {
            const vRoleRes = await ddb.send(
              new GetItemCommand({
                TableName: process.env.ROLES_TABLE!,
                Key: marshall({ roleName: viewerRole }),
              })
            );
            const vRole = vRoleRes.Item
              ? (unmarshall(vRoleRes.Item) as any)
              : null;
            const canModifyRoleAccess = !!vRole?.access?.roles?.update;
            if (!canModifyRoleAccess)
              return response(200, { roleName: role.roleName });
          }
        }
        return response(200, role);
      }
    }

    // Roles POST endpoint
    if (method === "POST" && path === "/roles") {
      const viewerSub = requesterSub(event);
      if (!viewerSub) return response(403, { message: "Forbidden" });

      // Load viewer role
      const viewerRes = await ddb.send(
        new GetItemCommand({
          TableName: USERS_TABLE,
          Key: marshall({ id: viewerSub }),
        })
      );
      const viewer = viewerRes.Item
        ? (unmarshall(viewerRes.Item) as any)
        : null;
      const roleName = viewer?.role as string | undefined;
      if (!roleName) return response(403, { message: "Forbidden" });

      const roleRes = await ddb.send(
        new GetItemCommand({
          TableName: process.env.ROLES_TABLE!,
          Key: marshall({ roleName }),
        })
      );
      const role = roleRes.Item ? (unmarshall(roleRes.Item) as any) : null;
      if (!role?.access?.roles?.create) {
        return response(403, { message: "Forbidden" });
      }

      const d = jsonParse(event.body) as any;
      const validPayload = validate(RoleSchema.partial(), d);

      const now = new Date().toISOString();
      const defaultAccess = {
        applications: {
          create: true,
          update: false,
          delete: false,
          approve: false,
          reject: false,
          readAll: false,
          readOwn: true,
        },
        formTemplates: {
          create: false,
          readAll: false,
          readActive: true,
          update: false,
          delete: false,
        },
        users: {
          create: false,
          readAll: false,
          update: false,
          delete: false,
        },
        auditLogs: {
          read: false,
        },
        systemSettings: {
          read: false,
          update: false,
        },
        roles: {
          readAll: false,
          create: false,
          update: false,
          delete: false,
        },
      };

      const item = {
        roleName: validPayload.roleName,
        roleLabel: validPayload.roleLabel || "New Role",
        access: { ...defaultAccess, ...(validPayload.access || {}) },
        createdAt: now,
        updatedAt: now,
      };

      await ddb.send(
        new PutItemCommand({
          TableName: process.env.ROLES_TABLE!,
          Item: marshall(item),
          ConditionExpression: "attribute_not_exists(roleName)",
        })
      );

      // Log audit
      await ddb.send(
        new PutItemCommand({
          TableName: AUDIT_TABLE,
          Item: marshall({
            id: randomUUID(),
            entity: "Role",
            entityId: item.roleName,
            actorUserId: viewerSub,
            action: "CREATE",
            changed: item,
            createdAt: now,
          }),
        })
      );

      return response(201, item);
    }

    // Roles PUT endpoint
    {
      const roleName = getPathParam(path, "/roles/");
      if (roleName && method === "PUT") {
        const viewerSub = requesterSub(event);
        if (!viewerSub) return response(403, { message: "Forbidden" });

        // Load viewer role
        const viewerRes = await ddb.send(
          new GetItemCommand({
            TableName: USERS_TABLE,
            Key: marshall({ id: viewerSub }),
          })
        );
        const viewer = viewerRes.Item
          ? (unmarshall(viewerRes.Item) as any)
          : null;
        const viewerRoleName = viewer?.role as string | undefined;
        if (!viewerRoleName) return response(403, { message: "Forbidden" });

        const viewerRoleRes = await ddb.send(
          new GetItemCommand({
            TableName: process.env.ROLES_TABLE!,
            Key: marshall({ roleName: viewerRoleName }),
          })
        );
        const viewerRole = viewerRoleRes.Item
          ? (unmarshall(viewerRoleRes.Item) as any)
          : null;
        if (!viewerRole?.access?.roles?.update) {
          return response(403, { message: "Forbidden" });
        }

        // Check if target role exists
        const targetRoleRes = await ddb.send(
          new GetItemCommand({
            TableName: process.env.ROLES_TABLE!,
            Key: marshall({ roleName }),
          })
        );
        if (!targetRoleRes.Item) {
          return response(404, { message: "Role not found" });
        }

        const before = unmarshall(targetRoleRes.Item) as any;
        const rawUpdates = jsonParse(event.body) as any;
        const validatedUpdates = validate(RoleSchema.partial(), rawUpdates);

        // Don't allow changing roleName (it's the primary key)
        if (
          validatedUpdates.roleName &&
          validatedUpdates.roleName !== roleName
        ) {
          return response(400, { message: "Cannot change roleName" });
        }

        const now = new Date().toISOString();
        const updatedItem = {
          ...before,
          ...validatedUpdates,
          roleName, // Ensure roleName stays the same
          updatedAt: now,
        };

        await ddb.send(
          new PutItemCommand({
            TableName: process.env.ROLES_TABLE!,
            Item: marshall(updatedItem),
          })
        );

        // Log audit
        const changed: any = {};
        Object.keys(validatedUpdates).forEach((k) => {
          if (
            k !== "updatedAt" &&
            (validatedUpdates as any)[k] !== (before as any)[k]
          ) {
            changed[k] = (validatedUpdates as any)[k];
          }
        });

        await ddb.send(
          new PutItemCommand({
            TableName: AUDIT_TABLE,
            Item: marshall({
              id: randomUUID(),
              entity: "Role",
              entityId: roleName,
              actorUserId: viewerSub,
              action: "UPDATE",
              changed,
              createdAt: now,
            }),
          })
        );

        return response(200, updatedItem);
      }
    }

    // Users
    if (method === "POST" && path === "/users") return await createUser(event);
    if (method === "GET" && path === "/users") return await listUsers(event);
    {
      const id = getPathParam(path, "/users/");
      if (id && method === "PUT") return await updateUser(event, id);
      if (id && method === "GET") return await getUser(event, id);
    }

    // Forms
    if (method === "POST" && path === "/forms") return await createForm(event);
    {
      const id = getPathParam(path, "/forms/");
      if (id && method === "PUT") return await updateForm(event, id);
      if (id && method === "GET") return await getForm(event, id);
      if (id && method === "DELETE") return await deleteForm(event, id);
    }
    if (method === "GET" && path === "/forms") {
      const viewerSub = requesterSub(event);
      if (!viewerSub) return response(403, { message: "Forbidden" });
      const viewerRes = await ddb.send(
        new GetItemCommand({
          TableName: USERS_TABLE,
          Key: marshall({ id: viewerSub }),
        })
      );
      const viewer = viewerRes.Item
        ? (unmarshall(viewerRes.Item) as any)
        : null;
      const roleName = viewer?.role as string | undefined;
      if (!roleName) return response(403, { message: "Forbidden" });
      const roleRes = await ddb.send(
        new GetItemCommand({
          TableName: process.env.ROLES_TABLE!,
          Key: marshall({ roleName }),
        })
      );
      const role = roleRes.Item ? (unmarshall(roleRes.Item) as any) : null;
      const canViewAll = !!role?.access?.formTemplates?.readAll;

      const all = await ddb.send(new ScanCommand({ TableName: FORMS_TABLE }));
      const items = (all.Items || []).map((it: any) => unmarshall(it));
      const visible = canViewAll
        ? items
        : items.filter(
            (f: any) =>
              f?.active &&
              Array.isArray(f?.visibleToRoles) &&
              f.visibleToRoles.includes(roleName)
          );
      return response(200, visible);
    }

    // Applications
    if (method === "POST" && path === "/applications")
      return await createApplication(event);
    {
      const id = getPathParam(path, "/applications/");
      if (id && method === "PUT") return await updateApplication(event, id);
      if (id && method === "GET") return await getApplication(event, id);
    }
    // Applications list with optional status filter
    if (method === "GET" && path === "/applications") {
      const viewerSub = requesterSub(event);
      if (!viewerSub) return response(403, { message: "Forbidden" });
      const qs = (event.queryStringParameters || {}) as Record<string, string>;
      const status = qs.status as
        | "DRAFT"
        | "APPROVED"
        | "REJECTED"
        | "PENDING_APPROVAL"
        | undefined;

      // Load viewer role
      const viewerRes = await ddb.send(
        new GetItemCommand({
          TableName: USERS_TABLE,
          Key: marshall({ id: viewerSub }),
        })
      );
      const viewer = viewerRes.Item
        ? (unmarshall(viewerRes.Item) as any)
        : null;
      const roleName = viewer?.role as string | undefined;
      if (!roleName) return response(403, { message: "Forbidden" });
      const roleRes = await ddb.send(
        new GetItemCommand({
          TableName: process.env.ROLES_TABLE!,
          Key: marshall({ roleName }),
        })
      );
      const role = roleRes.Item ? (unmarshall(roleRes.Item) as any) : null;
      const canViewAll = !!role?.access?.applications?.readAll;

      // If viewer can view all, allow optional status filter using status GSI
      if (canViewAll) {
        if (status) {
          const out = await ddb.send(
            new QueryCommand({
              TableName: APPLICATIONS_TABLE,
              IndexName: "status-index",
              KeyConditionExpression: "#s = :s",
              ExpressionAttributeNames: { "#s": "status" },
              ExpressionAttributeValues: marshall({ ":s": status }),
            })
          );
          const items = (out.Items || []).map((it: any) => unmarshall(it));
          return response(200, items);
        }
        // fallback: scan (could add a GSI for createdAt)
        const out = await ddb.send(
          new ScanCommand({ TableName: APPLICATIONS_TABLE })
        );
        const items = (out.Items || []).map((it: any) => unmarshall(it));
        return response(200, items);
      }

      // Otherwise, list only own applications; optional status filter in memory or via userId-index
      if (status) {
        const out = await ddb.send(
          new QueryCommand({
            TableName: APPLICATIONS_TABLE,
            IndexName: "userId-index",
            KeyConditionExpression: "#u = :u",
            ExpressionAttributeNames: { "#u": "userId" },
            ExpressionAttributeValues: marshall({ ":u": viewerSub }),
          })
        );
        const items = (out.Items || []).map((it: any) => unmarshall(it));
        return response(
          200,
          items.filter((i: any) => i.status === status)
        );
      }
      const out = await ddb.send(
        new QueryCommand({
          TableName: APPLICATIONS_TABLE,
          IndexName: "userId-index",
          KeyConditionExpression: "#u = :u",
          ExpressionAttributeNames: { "#u": "userId" },
          ExpressionAttributeValues: marshall({ ":u": viewerSub }),
        })
      );
      const items = (out.Items || []).map((it: any) => unmarshall(it));
      return response(200, items);
    }
    // Applications status update
    {
      const match = path.match(/^\/applications\/([^/]+)\/status$/);
      if (match && method === "POST") {
        return await updateApplicationStatus(
          event,
          decodeURIComponent(match[1])
        );
      }
    }

    // Audit Logs
    if (method === "GET" && path === "/audit-logs") {
      const viewerSub = requesterSub(event);
      if (!viewerSub) return response(403, { message: "Forbidden" });

      // Load viewer role
      const viewerRes = await ddb.send(
        new GetItemCommand({
          TableName: USERS_TABLE,
          Key: marshall({ id: viewerSub }),
        })
      );
      const viewer = viewerRes.Item
        ? (unmarshall(viewerRes.Item) as any)
        : null;
      const roleName = viewer?.role as string | undefined;
      if (!roleName) return response(403, { message: "Forbidden" });

      const roleRes = await ddb.send(
        new GetItemCommand({
          TableName: process.env.ROLES_TABLE!,
          Key: marshall({ roleName }),
        })
      );
      const role = roleRes.Item ? (unmarshall(roleRes.Item) as any) : null;
      if (!role?.access?.auditLogs?.read) {
        return response(403, { message: "Forbidden" });
      }

      const qs = (event.queryStringParameters || {}) as Record<string, string>;
      const entity = qs.entity as string | undefined;
      const action = qs.action as string | undefined;
      const dateFrom = qs.dateFrom as string | undefined;
      const dateTo = qs.dateTo as string | undefined;
      const page = parseInt(qs.page || "1");
      const limit = Math.min(parseInt(qs.limit || "20"), 100);

      // Build filter expression
      let filterExpressions: string[] = [];
      let expressionAttributeValues: Record<string, any> = {};
      let expressionAttributeNames: Record<string, string> = {};

      if (entity) {
        filterExpressions.push("#entity = :entity");
        expressionAttributeNames["#entity"] = "entity";
        expressionAttributeValues[":entity"] = entity;
      }

      if (action) {
        filterExpressions.push("#action = :action");
        expressionAttributeNames["#action"] = "action";
        expressionAttributeValues[":action"] = action;
      }

      if (dateFrom) {
        filterExpressions.push("#createdAt >= :dateFrom");
        expressionAttributeNames["#createdAt"] = "createdAt";
        expressionAttributeValues[":dateFrom"] = dateFrom;
      }

      if (dateTo) {
        filterExpressions.push("#createdAt <= :dateTo");
        expressionAttributeNames["#createdAt"] = "createdAt";
        expressionAttributeValues[":dateTo"] = dateTo;
      }

      const scanParams: any = {
        TableName: AUDIT_TABLE,
        Limit: limit,
      };

      if (filterExpressions.length > 0) {
        scanParams.FilterExpression = filterExpressions.join(" AND ");
        scanParams.ExpressionAttributeNames = expressionAttributeNames;
        scanParams.ExpressionAttributeValues = marshall(
          expressionAttributeValues
        );
      }

      const result = await ddb.send(new ScanCommand(scanParams));
      const items = (result.Items || []).map((it: any) => unmarshall(it));

      // Sort by createdAt descending (newest first)
      items.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Simple pagination (in a real app, you'd use DynamoDB's LastEvaluatedKey)
      const startIndex = (page - 1) * limit;
      const paginatedItems = items.slice(startIndex, startIndex + limit);

      // Fetch user emails for actorUserId
      const enrichedItems = await Promise.all(
        paginatedItems.map(async (item: any) => {
          try {
            if (item.actorUserId && item.actorUserId !== "system") {
              const userRes = await ddb.send(
                new GetItemCommand({
                  TableName: USERS_TABLE,
                  Key: marshall({ id: item.actorUserId }),
                })
              );
              const user = userRes.Item
                ? (unmarshall(userRes.Item) as any)
                : null;
              return {
                ...item,
                userEmail: user?.email || "Unknown User",
              };
            } else {
              return {
                ...item,
                userEmail: "System",
              };
            }
          } catch (error) {
            console.error("Error fetching user email:", error);
            return {
              ...item,
              userEmail: "Unknown User",
            };
          }
        })
      );

      return response(200, {
        items: enrichedItems,
        total: items.length,
        page,
        limit,
        hasMore: startIndex + limit < items.length,
      });
    }

    return response(404, { message: "Not found" });
  } catch (err: any) {
    if (err?.statusCode === 400)
      return response(400, {
        message: err.message,
        details: err.details ?? [],
      });
    console.error(err);
    return response(500, { message: "Internal Server Error" });
  }
};

// Minimal stub for scheduled/async notifications
export const notifyStatusChange: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const body = jsonParse<{
      applicationId: string;
      status?: "APPROVED" | "REJECTED" | "PENDING_APPROVAL" | "DRAFT";
    }>(event.body);
    const applicationId = body?.applicationId as string | undefined;
    const status = body?.status as
      | "APPROVED"
      | "REJECTED"
      | "PENDING_APPROVAL"
      | "DRAFT"
      | undefined;

    if (!applicationId) {
      return response(400, { message: "applicationId is required" });
    }

    // Load application
    const appRes = await ddb.send(
      new GetItemCommand({
        TableName: APPLICATIONS_TABLE,
        Key: marshall({ id: applicationId }),
      })
    );
    const application = appRes.Item ? (unmarshall(appRes.Item) as any) : null;
    if (!application)
      return response(404, { message: "Application not found" });

    // Load user
    const userRes = await ddb.send(
      new GetItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: application.userId }),
      })
    );
    const user = userRes.Item ? (unmarshall(userRes.Item) as any) : null;
    if (!user?.email)
      return response(404, { message: "Applicant email not found" });

    const finalStatus = status ?? application.status ?? "UPDATED";
    const subject = `Your application ${applicationId} status update`;
    const bodyText = `Hello ${user.firstName ?? ""},

Your application (${applicationId}) status is now: ${finalStatus}.

Regards,
UniApply`;

    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: SES_SENDER_EMAIL,
        Destination: { ToAddresses: [user.email] },
        Content: {
          Simple: {
            Subject: { Data: subject },
            Body: { Text: { Data: bodyText } },
          },
        },
      })
    );

    await writeAudit(
      "APPLICATION",
      applicationId,
      requesterSub(event) || application.userId,
      "NOTIFY",
      { to: user.email, status: finalStatus }
    );

    return response(200, { ok: true });
  } catch (err: any) {
    console.error("notifyStatusChange error", err);
    return response(500, { message: "Internal Server Error" });
  }
};

// ------------ Cognito Triggers ------------
// Create minimal Users entry right after signup confirmation
export const postConfirmation: PostConfirmationTriggerHandler = async (
  event
) => {
  try {
    if (event.triggerSource !== "PostConfirmation_ConfirmSignUp") return event;
    const attrs = (event as any)?.request?.userAttributes || {};
    const sub: string | undefined = attrs.sub;
    const email: string | undefined = attrs.email;
    const firstName: string | undefined = attrs.given_name;
    const lastName: string | undefined = attrs.family_name;
    if (!sub || !email) return event;

    const now = nowIso();
    const item = {
      id: sub,
      role: "USER",
      email,
      firstName: firstName || "",
      lastName: lastName || "",
      active: true,
      verified: true,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await ddb.send(
        new PutItemCommand({
          TableName: USERS_TABLE,
          Item: marshall(item, { removeUndefinedValues: true }),
          ConditionExpression: "attribute_not_exists(id)",
        })
      );
      await writeAudit("USER", sub, sub, "CREATE", {
        email,
        firstName: item.firstName,
        lastName: item.lastName,
      });
    } catch (e: any) {
      if (e?.name !== "ConditionalCheckFailedException") throw e;
    }
  } catch (e) {
    console.error("postConfirmation error", e);
  }
  return event;
};
