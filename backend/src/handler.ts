// src/handler.ts
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
} from "aws-lambda";
import { randomUUID } from "crypto";
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
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

// ------------ Users ------------
async function createUser(event: APIGatewayProxyEventV2) {
  const body = jsonParse(event.body);
  const dto = validate(UserCreateSchema, body);

  const id = randomUUID();
  const item = { id, ...dto, createdAt: nowIso(), updatedAt: nowIso() };

  await ddb.send(
    new PutItemCommand({
      TableName: USERS_TABLE,
      Item: marshall(item, { removeUndefinedValues: true }),
    })
  );

  await writeAudit("USER", id, requesterSub(event) || "system", "CREATE", dto);
  return response(201, { id, ...dto });
}

async function updateUser(event: APIGatewayProxyEventV2, id: string) {
  const body = jsonParse(event.body);
  const dto = validate(UserUpdateSchema, body);

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

async function getUser(_event: APIGatewayProxyEventV2, id: string) {
  const res = await ddb.send(
    new GetItemCommand({ TableName: USERS_TABLE, Key: marshall({ id }) })
  );
  if (!res.Item) return response(404, { message: "User not found" });
  return response(200, unmarshall(res.Item));
}

// ------------ Forms ------------
async function createForm(event: APIGatewayProxyEventV2) {
  const body = jsonParse(event.body);
  const dto = validate(FormTemplateCreateSchema, body);

  const id = randomUUID();
  const item = { id, ...dto, createdAt: nowIso(), updatedAt: nowIso() };

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

  const prevRes = await ddb.send(
    new GetItemCommand({ TableName: FORMS_TABLE, Key: marshall({ id }) })
  );
  const prev = prevRes.Item ? unmarshall(prevRes.Item) : null;
  if (!prev) return response(404, { message: "Form not found" });

  const patch = { ...dto, updatedAt: nowIso() };
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

async function getForm(_event: APIGatewayProxyEventV2, id: string) {
  const res = await ddb.send(
    new GetItemCommand({ TableName: FORMS_TABLE, Key: marshall({ id }) })
  );
  if (!res.Item) return response(404, { message: "Form not found" });
  return response(200, unmarshall(res.Item));
}

// ------------ Applications ------------
async function createApplication(event: APIGatewayProxyEventV2) {
  const body = jsonParse(event.body);
  const dto = validate(ApplicationCreateSchema, body);

  const id = randomUUID();
  const item = {
    id,
    userId: dto.userId,
    formId: dto.formId,
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

  const prevRes = await ddb.send(
    new GetItemCommand({ TableName: APPLICATIONS_TABLE, Key: marshall({ id }) })
  );
  const prev = prevRes.Item ? (unmarshall(prevRes.Item) as any) : null;
  if (!prev) return response(404, { message: "Application not found" });

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

  // Notify on decision transitions
  if (dto.status && (dto.status === "APPROVED" || dto.status === "REJECTED")) {
    await tryNotifyApplicantDecision(prev.userId, id, dto.status);
  }

  return response(200, { ok: true });
}

async function getApplication(_event: APIGatewayProxyEventV2, id: string) {
  const res = await ddb.send(
    new GetItemCommand({ TableName: APPLICATIONS_TABLE, Key: marshall({ id }) })
  );
  if (!res.Item) return response(404, { message: "Application not found" });
  return response(200, unmarshall(res.Item));
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
    const body = `Hello ${user.firstName ?? ""},\n\nYour application (${applicationId}) has been ${status.toLowerCase()}.\n\nRegards,\nUniApply`;

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

    // Users
    if (method === "POST" && path === "/users") return await createUser(event);
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
    }

    // Applications
    if (method === "POST" && path === "/applications")
      return await createApplication(event);
    {
      const id = getPathParam(path, "/applications/");
      if (id && method === "PUT") return await updateApplication(event, id);
      if (id && method === "GET") return await getApplication(event, id);
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
    const bodyText = `Hello ${user.firstName ?? ""},\n\nYour application (${applicationId}) status is now: ${finalStatus}.\n\nRegards,\nUniApply`;

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
