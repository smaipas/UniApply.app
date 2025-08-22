import { z } from "zod";
// ========= Shared enums =========
export const OfficialIdType = z.enum([
    "ID",
    "PASSPORT",
    "DRIVING_LICENCE",
    "OTHER",
]);
export const Gender = z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]);
export const AppStatus = z.enum([
    "DRAFT",
    "APPROVED",
    "REJECTED",
    "PENDING_APPROVAL",
]);
export const StepStatus = z.enum(["APPROVED", "REJECTED", "PENDING_APPROVAL"]);
export const FieldInputType = z.enum([
    "TEXT",
    "LONG_TEXT",
    "NUMBER",
    "FILE",
    "DATE",
    "SELECT",
    "CHECKBOX",
]);
// ========= Helpers =========
const e164Phone = z.string().regex(/^\+?[1-9]\d{1,14}$/, {
    message: "Invalid phone (use E.164, e.g. +357...)",
});
const id = z.string().min(1).max(64);
const isoDate = z.iso.datetime().optional();
const stringMax = (n) => z.string().min(1).max(n);
// ========= Address =========
export const AddressSchema = z
    .object({
    street: z.string().optional(),
    number: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(), // Will be validated against countries list in backend
})
    .strict();
// ========= Roles =========
export const RoleAccessSchema = z
    .object({
    applications: z
        .object({
        create: z.boolean(),
        update: z.boolean(),
        delete: z.boolean(),
        approve: z.boolean(),
        reject: z.boolean(),
        readAll: z.boolean(),
        readOwn: z.boolean(),
    })
        .strict(),
    formTemplates: z
        .object({
        create: z.boolean(),
        readAll: z.boolean(),
        readActive: z.boolean(),
        update: z.boolean(),
        delete: z.boolean(),
    })
        .strict(),
    users: z
        .object({
        create: z.boolean(),
        readAll: z.boolean(),
        update: z.boolean(),
        delete: z.boolean(),
    })
        .strict(),
    auditLogs: z
        .object({
        read: z.boolean(),
    })
        .strict(),
    systemSettings: z
        .object({
        read: z.boolean(),
        update: z.boolean(),
    })
        .strict(),
    roles: z
        .object({
        readAll: z.boolean(),
        create: z.boolean(),
        update: z.boolean(),
        delete: z.boolean(),
    })
        .strict(),
})
    .strict();
export const RoleSchema = z
    .object({
    roleName: z
        .string()
        .min(2)
        .max(64)
        .transform((s) => s.toUpperCase().replace(/\s+/g, "")),
    roleLabel: z.string().min(2).max(128),
    access: RoleAccessSchema,
})
    .strict();
// DB model includes timestamps for persistence
export const RoleModelSchema = RoleSchema.extend({
    createdAt: z.string(),
    updatedAt: z.string(),
}).strict();
// ========= Users =========
export const UserBase = z
    .object({
    role: z.string().min(2).max(64),
    firstName: z.string().min(2).max(64),
    lastName: z.string().min(2).max(64),
    studentId: z.string().min(1).max(10).optional(), // string to preserve leading zeros
    userOfficialId: z.string().min(2).max(32).optional(),
    userOfficialType: OfficialIdType.optional(),
    tel: e164Phone.optional(),
    email: z.email(),
    address: AddressSchema.optional(),
    dateOfBirth: z.string().optional(), // ISO date string
    nationality: z.string().min(1).max(100).optional(),
    gender: Gender.optional(),
    active: z.boolean().default(true),
    verified: z.boolean().default(false),
    settings: z
        .object({ dark: z.boolean().default(false) })
        .partial()
        .optional(),
})
    .strict();
export const UserCreateSchema = UserBase;
export const UserUpdateSchema = UserBase.partial().strict();
export const UserCreateMinimalSchema = z
    .object({
    firstName: z.string().min(2).max(64),
    lastName: z.string().min(2).max(64),
    email: z.email(),
})
    .strict();
// DB model for Users (includes id and timestamps)
export const UserModelSchema = UserBase.extend({
    id: z.string().min(1).max(64),
    createdAt: z.string(),
    updatedAt: z.string(),
}).strict();
// ========= Form Templates =========
export const ValidationRuleSchema = z
    .object({
    rule: z.enum(["required", "min", "max", "regex", "email", "e164", "enum"]),
    value: z.any().optional(),
    message: z.string().optional(),
})
    .strict();
export const FormFieldSchema = z
    .object({
    name: z.string().min(1).max(64),
    label: z.string().min(1).max(128),
    description: z.string().max(512).optional(),
    inputType: FieldInputType,
    validationRules: z.array(ValidationRuleSchema).default([]),
    // Default prefilled value for applicable types
    defaultValue: z.union([z.string(), z.number()]).optional(),
    // for SELECT fields: allow either array of strings or array of {label,value}
    options: z
        .union([
        z.array(z.string()),
        z.array(z.object({ label: z.string(), value: z.string() }).strict()),
    ])
        .optional(),
})
    .superRefine((field, ctx) => {
    const t = field.inputType;
    const dv = field.defaultValue;
    const allowsDefault = t === "TEXT" || t === "LONG_TEXT" || t === "NUMBER";
    if (typeof dv !== "undefined" && !allowsDefault) {
        ctx.addIssue({
            code: "custom",
            message: "defaultValue is only allowed for TEXT, LONG_TEXT, or NUMBER",
            path: ["defaultValue"],
        });
    }
    if (t === "NUMBER" && typeof dv !== "undefined" && typeof dv !== "number") {
        ctx.addIssue({
            code: "custom",
            message: "defaultValue must be a number for NUMBER fields",
            path: ["defaultValue"],
        });
    }
})
    .strict();
export const FormTemplateCreateSchema = z
    .object({
    title: z.string().min(2).max(64),
    description: z.string().min(2).max(1024).optional(),
    fields: z.array(FormFieldSchema).min(1).max(200),
    approvalSteps: z
        .array(z.object({ role: z.string().min(2).max(64) }).strict())
        .min(1)
        .max(10),
    visibleToRoles: z.array(z.string()).min(1).max(50),
    active: z.boolean().default(true),
})
    .strict();
export const FormTemplateUpdateSchema = FormTemplateCreateSchema.partial().strict();
// DB model for FormTemplate (what is stored in DynamoDB)
export const FormTemplateModelSchema = z
    .object({
    id: z.string().min(1).max(64),
    title: z.string().min(2).max(64),
    description: z.string().min(2).max(1024).optional(),
    // We keep fields loosely typed to allow backend/frontend to evolve independently
    fields: z.array(z.any()),
    approvalSteps: z
        .array(z
        .object({
        role: z.string().min(2).max(64),
        stepOrder: z.number().int().min(1),
    })
        .strict())
        .min(1)
        .max(10),
    visibleToRoles: z.array(z.string()).min(1).max(50),
    active: z.boolean(),
    version: z.number().int().min(1),
    createdAt: z.string(),
    updatedAt: z.string(),
})
    .strict();
// ========= Applications =========
// Application step now allows updatedAt (optional) so your route can set it.
export const ApplicationStepSchema = z
    .object({
    role: z.string().min(2).max(64),
    status: z.enum(["APPROVED", "REJECTED", "PENDING_APPROVAL"]),
    statusText: z.string().max(1024).optional(),
    updatedAt: z.string().optional(), // <-- added
    updatedById: z.string().min(1).max(64).optional(), // <-- user ID who made the decision
    updatedByFullName: z.string().min(1).max(128).optional(), // <-- full name of user who made the decision
})
    .strict();
// Create / Update DTOs stay the same (they’ll accept steps with/without updatedAt)
export const ApplicationCreateSchema = z
    .object({
    userId: z.string().min(1).max(64),
    formId: z.string().min(1).max(64),
    formTitle: z.string().min(1).max(256),
    fields: z.record(z.string(), z.any()),
    approvalSteps: z.array(ApplicationStepSchema).max(10),
    status: z
        .enum(["DRAFT", "APPROVED", "REJECTED", "PENDING_APPROVAL"])
        .default("DRAFT"),
})
    .refine((data) => {
    // For DRAFT status, approvalSteps can be empty
    if (data.status === "DRAFT") {
        return true; // Allow empty array
    }
    // For other statuses, approvalSteps must have at least 1 item
    return data.approvalSteps.length >= 1;
}, {
    message: "Approval steps are required for non-draft applications",
    path: ["approvalSteps"],
})
    .strict();
export const ApplicationUpdateSchema = z
    .object({
    fields: z.record(z.string(), z.any()).optional(),
    approvalSteps: z.array(ApplicationStepSchema).optional(),
    status: z
        .enum(["DRAFT", "APPROVED", "REJECTED", "PENDING_APPROVAL"])
        .optional(),
})
    .refine((data) => {
    // If approvalSteps is not provided, validation passes
    if (!data.approvalSteps) {
        return true;
    }
    // If status is not provided, we can't validate (will be validated by backend)
    if (!data.status) {
        return true;
    }
    // For DRAFT status, approvalSteps can be empty
    if (data.status === "DRAFT") {
        return true; // Allow empty array
    }
    // For other statuses, approvalSteps must have at least 1 item
    return data.approvalSteps.length >= 1;
}, {
    message: "Approval steps are required for non-draft applications",
    path: ["approvalSteps"],
})
    .strict();
// Add a DB model schema (what you actually store in DynamoDB)
export const ApplicationModelSchema = z
    .object({
    id: z.string().min(1).max(64),
    userId: z.string().min(1).max(64),
    formId: z.string().min(1).max(64),
    formTitle: z.string().min(1).max(256),
    formVersion: z.number().int().min(1),
    fields: z.record(z.string(), z.any()),
    approvalSteps: z.array(ApplicationStepSchema),
    status: z.enum(["DRAFT", "APPROVED", "REJECTED", "PENDING_APPROVAL"]),
    createdAt: z.string(),
    updatedAt: z.string(),
    user: z
        .object({
        firstName: z.string(),
        lastName: z.string(),
        studentId: z.string().optional(),
    })
        .optional(),
})
    .strict();
// ========= Audit Logs (minimal diff) =========
export const AuditLogSchema = z
    .object({
    id: id,
    entity: z.enum(["USER", "FORM_TEMPLATE", "APPLICATION"]),
    entityId: id,
    actorUserId: id,
    action: z.enum([
        "CREATE",
        "UPDATE",
        "DELETE",
        "APPROVE",
        "REJECT",
        "SUBMIT",
    ]),
    changed: z.record(z.string(), z.any()).optional(),
    createdAt: z.string(), // or datetime() if you store ISO
})
    .strict();
export const PresignUploadSchema = z
    .object({
    contentType: z.string().min(1).optional(),
})
    .strict();
