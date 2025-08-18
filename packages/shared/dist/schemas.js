import { z } from "zod";
// ========= Shared enums =========
export const OfficialIdType = z.enum([
    "ID",
    "PASSPORT",
    "DRIVING_LICENCE",
    "OTHER",
]);
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
    country: z.string().optional(), // switch to z.enum([...]) if you maintain a whitelist
})
    .strict();
// ========= Roles =========
export const RoleAccessSchema = z
    .object({
    canCreateFormTemplates: z.boolean(),
    canCreateApplications: z.boolean(),
    canApproveForms: z.boolean(),
    canModifyApplicationSettings: z.boolean(),
    canModifyUserData: z.boolean(),
    canViewApplications: z.boolean(),
    canViewAllApplications: z.boolean(),
    canViewAllFormTemplates: z.boolean(),
    canViewAllUsers: z.boolean(),
    canModifyUserRoleAccess: z.boolean(),
})
    .strict();
export const RoleSchema = z
    .object({
    roleName: z
        .string()
        .min(2)
        .max(64)
        .transform((s) => s.toUpperCase().replace(/\s+/g, "")),
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
    studentId: z.string().min(1).max(10), // string to preserve leading zeros
    userOfficialId: z.string().min(2).max(32),
    userOfficialType: OfficialIdType,
    tel: e164Phone,
    email: z.email(),
    address: AddressSchema.optional(),
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
    // for SELECT fields
    options: z
        .array(z.object({ label: z.string(), value: z.string() }).strict())
        .optional(),
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
    updatedByEmail: z.email().optional(),
})
    .strict();
// Create / Update DTOs stay the same (they’ll accept steps with/without updatedAt)
export const ApplicationCreateSchema = z
    .object({
    userId: z.string().min(1).max(64),
    formId: z.string().min(1).max(64),
    fields: z.record(z.string(), z.any()),
    approvalSteps: z.array(ApplicationStepSchema).min(1).max(10),
    status: z
        .enum(["DRAFT", "APPROVED", "REJECTED", "PENDING_APPROVAL"])
        .default("DRAFT"),
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
    .strict();
// Add a DB model schema (what you actually store in DynamoDB)
export const ApplicationModelSchema = z
    .object({
    id: z.string().min(1).max(64),
    userId: z.string().min(1).max(64),
    formId: z.string().min(1).max(64),
    fields: z.record(z.string(), z.any()),
    approvalSteps: z.array(ApplicationStepSchema),
    status: z.enum(["DRAFT", "APPROVED", "REJECTED", "PENDING_APPROVAL"]),
    createdAt: z.string(),
    updatedAt: z.string(),
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
