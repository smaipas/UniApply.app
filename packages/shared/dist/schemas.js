import { z } from "zod";
// Enhanced sanitization helpers
export const sanitizedString = (maxLength = 1000) => z
    .string()
    .trim()
    .max(maxLength)
    .transform((val) => {
    // Remove control characters except \t, \n, \r
    return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
})
    .refine((val) => {
    // Check for potential injection patterns
    const dangerousPatterns = [
        /<script[^>]*>[\s\S]*?<\/script>/gi,
        /javascript\s*:/i,
        /on\w+\s*=/i,
        /\$\w+\(/i, // NoSQL patterns
        /(union|select|insert|update|delete|drop|create|alter)\s+/i,
    ];
    return !dangerousPatterns.some((pattern) => pattern.test(val));
}, "Input contains potentially malicious content");
export const sanitizedEmail = z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .max(254)
    .refine((val) => {
    // Additional email security checks
    const dangerousChars = /[<>'"&]/;
    return !dangerousChars.test(val);
}, "Email contains invalid characters");
export const sanitizedName = z
    .string()
    .trim()
    .min(1)
    .max(100)
    .transform((val) => {
    // Remove control characters and normalize whitespace
    return val
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        .replace(/\s+/g, " ");
})
    .refine((val) => {
    // Only allow letters, spaces, hyphens, apostrophes
    const validNamePattern = /^[a-zA-ZÀ-ÿĀ-žА-я\s'\-\.]+$/;
    return validNamePattern.test(val);
}, "Name contains invalid characters");
export const sanitizedId = z
    .string()
    .trim()
    .min(1)
    .max(64)
    .refine((val) => {
    // Only allow alphanumeric characters, hyphens, underscores
    const validIdPattern = /^[a-zA-Z0-9\-_]+$/;
    return validIdPattern.test(val);
}, "ID contains invalid characters");
export const sanitizedPhone = z
    .string()
    .trim()
    .transform((val) => {
    // Remove all non-digit characters except +
    return val.replace(/[^\d+]/g, "");
})
    .refine((val) => {
    if (val === "")
        return true;
    // E.164 format validation
    const e164Pattern = /^\+?[1-9]\d{1,14}$/;
    return e164Pattern.test(val);
}, "Invalid phone number format");
// ========= Shared enums =========
export const OfficialIdType = z.enum([
    "ID",
    "PASSPORT",
    "DRIVING_LICENCE",
    "CYPRIOT_ID",
    "REPATRIATED_GREEK_ID",
    "POLICE_ID",
    "SOLDIER_ID",
    "MILLITARY_ID",
    "OTHER",
]);
export const Gender = z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]);
export const MilitaryObligations = z.enum(["OF_SERVICE", "COMPLETED"]);
export const MaritalStatus = z.enum([
    "SINGLE",
    "MARRIED",
    "DIVORCED",
    "WIDOWED",
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
    "FIXED_TEXT",
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
    role: z
        .string()
        .trim()
        .min(2)
        .max(64)
        .transform((val) => {
        // Remove control characters except \t, \n, \r
        return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    })
        .refine((val) => {
        // Check for potential injection patterns
        const dangerousPatterns = [
            /<script[^>]*>[\s\S]*?<\/script>/gi,
            /javascript\s*:/i,
            /on\w+\s*=/i,
            /\$\w+\(/i, // NoSQL patterns
            /(union|select|insert|update|delete|drop|create|alter)\s+/i,
        ];
        return !dangerousPatterns.some((pattern) => pattern.test(val));
    }, "Input contains potentially malicious content"),
    firstName: z
        .string()
        .trim()
        .min(2)
        .max(64)
        .transform((val) => {
        // Remove control characters and normalize whitespace
        return val
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
            .replace(/\s+/g, " ");
    })
        .refine((val) => {
        // Only allow letters, spaces, hyphens, apostrophes
        const validNamePattern = /^[a-zA-ZÀ-ÿĀ-žА-я\s'\-\.]+$/;
        return validNamePattern.test(val);
    }, "First name contains invalid characters"),
    lastName: z
        .string()
        .trim()
        .min(2)
        .max(64)
        .transform((val) => {
        // Remove control characters and normalize whitespace
        return val
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
            .replace(/\s+/g, " ");
    })
        .refine((val) => {
        // Only allow letters, spaces, hyphens, apostrophes
        const validNamePattern = /^[a-zA-ZÀ-ÿĀ-žА-я\s'\-\.]+$/;
        return validNamePattern.test(val);
    }, "Last name contains invalid characters"),
    fathersName: z
        .string()
        .trim()
        .min(2)
        .max(32)
        .transform((val) => {
        // Remove control characters and normalize whitespace
        return val
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
            .replace(/\s+/g, " ");
    })
        .refine((val) => {
        // Only allow letters, spaces, hyphens, apostrophes
        const validNamePattern = /^[a-zA-ZÀ-ÿĀ-žА-я\s'\-\.]+$/;
        return validNamePattern.test(val);
    }, "Father's name contains invalid characters"),
    mothersName: z
        .string()
        .trim()
        .min(2)
        .max(32)
        .transform((val) => {
        // Remove control characters and normalize whitespace
        return val
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
            .replace(/\s+/g, " ");
    })
        .refine((val) => {
        // Only allow letters, spaces, hyphens, apostrophes
        const validNamePattern = /^[a-zA-ZÀ-ÿĀ-žА-я\s'\-\.]+$/;
        return validNamePattern.test(val);
    }, "Mother's name contains invalid characters"),
    studentId: sanitizedId.max(10).optional(), // string to preserve leading zeros
    userOfficialId: z
        .string()
        .trim()
        .min(2)
        .max(32)
        .transform((val) => {
        // Remove control characters except \t, \n, \r
        return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    })
        .refine((val) => {
        // Check for potential injection patterns
        const dangerousPatterns = [
            /<script[^>]*>[\s\S]*?<\/script>/gi,
            /javascript\s*:/i,
            /on\w+\s*=/i,
            /\$\w+\(/i, // NoSQL patterns
            /(union|select|insert|update|delete|drop|create|alter)\s+/i,
        ];
        return !dangerousPatterns.some((pattern) => pattern.test(val));
    }, "Input contains potentially malicious content")
        .optional(),
    userOfficialIdIssuedDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
        .optional(),
    userOfficialIdIssuedAuthority: z
        .string()
        .trim()
        .min(2)
        .max(32)
        .transform((val) => {
        // Remove control characters except \t, \n, \r
        return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    })
        .refine((val) => {
        // Check for potential injection patterns
        const dangerousPatterns = [
            /<script[^>]*>[\s\S]*?<\/script>/gi,
            /javascript\s*:/i,
            /on\w+\s*=/i,
            /\$\w+\(/i, // NoSQL patterns
            /(union|select|insert|update|delete|drop|create|alter)\s+/i,
        ];
        return !dangerousPatterns.some((pattern) => pattern.test(val));
    }, "Input contains potentially malicious content")
        .optional(),
    userOfficialType: OfficialIdType.optional(),
    mobilePhoneNumber: sanitizedPhone.optional(), // renamed from tel
    phoneNumber: sanitizedPhone.optional(), // new field
    email: sanitizedEmail,
    currentAddress: AddressSchema.optional(), // renamed from address
    permanentResidenceAddress: AddressSchema.optional(), // new field
    dateOfBirth: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
        .optional(),
    placeOfBirth: z
        .string()
        .trim()
        .min(2)
        .max(32)
        .transform((val) => {
        // Remove control characters except \t, \n, \r
        return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    })
        .refine((val) => {
        // Check for potential injection patterns
        const dangerousPatterns = [
            /<script[^>]*>[\s\S]*?<\/script>/gi,
            /javascript\s*:/i,
            /on\w+\s*=/i,
            /\$\w+\(/i, // NoSQL patterns
            /(union|select|insert|update|delete|drop|create|alter)\s+/i,
        ];
        return !dangerousPatterns.some((pattern) => pattern.test(val));
    }, "Input contains potentially malicious content")
        .optional(),
    nationality: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .transform((val) => {
        // Remove control characters except \t, \n, \r
        return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    })
        .refine((val) => {
        // Check for potential injection patterns
        const dangerousPatterns = [
            /<script[^>]*>[\s\S]*?<\/script>/gi,
            /javascript\s*:/i,
            /on\w+\s*=/i,
            /\$\w+\(/i, // NoSQL patterns
            /(union|select|insert|update|delete|drop|create|alter)\s+/i,
        ];
        return !dangerousPatterns.some((pattern) => pattern.test(val));
    }, "Input contains potentially malicious content")
        .optional(),
    gender: Gender.optional(),
    maleRegistryNumber: z
        .string()
        .trim()
        .max(32)
        .transform((val) => {
        // Remove control characters except \t, \n, \r
        return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    })
        .refine((val) => {
        // Check for potential injection patterns
        const dangerousPatterns = [
            /<script[^>]*>[\s\S]*?<\/script>/gi,
            /javascript\s*:/i,
            /on\w+\s*=/i,
            /\$\w+\(/i, // NoSQL patterns
            /(union|select|insert|update|delete|drop|create|alter)\s+/i,
        ];
        return !dangerousPatterns.some((pattern) => pattern.test(val));
    }, "Input contains potentially malicious content")
        .optional(),
    maleRegistryIssuedPlace: z
        .string()
        .trim()
        .max(32)
        .transform((val) => {
        // Remove control characters except \t, \n, \r
        return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    })
        .refine((val) => {
        // Check for potential injection patterns
        const dangerousPatterns = [
            /<script[^>]*>[\s\S]*?<\/script>/gi,
            /javascript\s*:/i,
            /on\w+\s*=/i,
            /\$\w+\(/i, // NoSQL patterns
            /(union|select|insert|update|delete|drop|create|alter)\s+/i,
        ];
        return !dangerousPatterns.some((pattern) => pattern.test(val));
    }, "Input contains potentially malicious content")
        .optional(),
    militaryObligations: MilitaryObligations.optional(),
    maritalStatus: MaritalStatus.optional(),
    numberOfChildren: z.number().int().min(0).optional(),
    municipalRegisterNumber: z.number().int().min(0).optional(),
    municipalRegisterPrefecture: z
        .string()
        .trim()
        .max(32)
        .transform((val) => {
        // Remove control characters except \t, \n, \r
        return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    })
        .refine((val) => {
        // Check for potential injection patterns
        const dangerousPatterns = [
            /<script[^>]*>[\s\S]*?<\/script>/gi,
            /javascript\s*:/i,
            /on\w+\s*=/i,
            /\$\w+\(/i, // NoSQL patterns
            /(union|select|insert|update|delete|drop|create|alter)\s+/i,
        ];
        return !dangerousPatterns.some((pattern) => pattern.test(val));
    }, "Input contains potentially malicious content")
        .optional(),
    ssn: z.number().int().min(0).optional(),
    academicEnrollmentYear: z
        .number()
        .int()
        .min(1900)
        .max(new Date().getFullYear() + 10)
        .optional(),
    department: z
        .string()
        .trim()
        .max(64)
        .transform((val) => {
        // Remove control characters except \t, \n, \r
        return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    })
        .refine((val) => {
        // Check for potential injection patterns
        const dangerousPatterns = [
            /<script[^>]*>[\s\S]*?<\/script>/gi,
            /javascript\s*:/i,
            /on\w+\s*=/i,
            /\$\w+\(/i, // NoSQL patterns
            /(union|select|insert|update|delete|drop|create|alter)\s+/i,
        ];
        return !dangerousPatterns.some((pattern) => pattern.test(val));
    }, "Input contains potentially malicious content")
        .optional(),
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
    label: z.string().max(128).optional(),
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
    // for SELECT fields: allow multiple values selection
    allowSelectMultipleValues: z.boolean().default(false),
    // for FIXED_TEXT fields: the text content to display
    fixedTextContent: z.string().max(2000).optional(),
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
    // Validate FIXED_TEXT fields have content
    if (t === "FIXED_TEXT" && !field.fixedTextContent) {
        ctx.addIssue({
            code: "custom",
            message: "fixedTextContent is required for FIXED_TEXT fields",
            path: ["fixedTextContent"],
        });
    }
    // FIXED_TEXT fields should not have validation rules
    if (t === "FIXED_TEXT" &&
        field.validationRules &&
        field.validationRules.length > 0) {
        ctx.addIssue({
            code: "custom",
            message: "FIXED_TEXT fields should not have validation rules",
            path: ["validationRules"],
        });
    }
    // Validate SELECT fields have options when allowSelectMultipleValues is true
    if (t === "SELECT" &&
        field.allowSelectMultipleValues &&
        (!field.options || field.options.length === 0)) {
        ctx.addIssue({
            code: "custom",
            message: "options are required for SELECT fields with multiple values",
            path: ["options"],
        });
    }
})
    .strict();
// ========= Approval Steps =========
// New approval step types for enhanced flexibility
export const ApprovalStepType = z.enum([
    "USER_GROUP",
    "FIXED_USER",
    "DYNAMIC_USER",
]);
// User information for fixed user approval steps
export const UserInfoSchema = z
    .object({
    id: z.string().min(1).max(64),
    firstName: z.string().min(1).max(64),
    lastName: z.string().min(1).max(64),
})
    .strict();
// Template approval step schema (for form templates)
export const TemplateApprovalStepSchema = z.discriminatedUnion("type", [
    // User group approval (existing functionality)
    z
        .object({
        type: z.literal("USER_GROUP"),
        role: z.string().min(2).max(64),
    })
        .strict(),
    // Fixed user approval (specific user)
    z
        .object({
        type: z.literal("FIXED_USER"),
        user: UserInfoSchema,
    })
        .strict(),
    // Dynamic user approval (user-specified during application creation)
    z
        .object({
        type: z.literal("DYNAMIC_USER"),
        role: z.string().min(2).max(64),
        label: z.string().min(2).max(128),
    })
        .strict(),
]);
export const FormTemplateCreateSchema = z
    .object({
    title: z
        .string()
        .trim()
        .min(2)
        .max(64)
        .transform((val) => {
        // Remove control characters except \t, \n, \r
        return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    })
        .refine((val) => {
        // Check for potential injection patterns
        const dangerousPatterns = [
            /<script[^>]*>[\s\S]*?<\/script>/gi,
            /javascript\s*:/i,
            /on\w+\s*=/i,
            /\$\w+\(/i, // NoSQL patterns
            /(union|select|insert|update|delete|drop|create|alter)\s+/i,
        ];
        return !dangerousPatterns.some((pattern) => pattern.test(val));
    }, "Input contains potentially malicious content"),
    description: z
        .string()
        .trim()
        .max(1024)
        .transform((val) => {
        // Remove control characters except \t, \n, \r
        return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    })
        .refine((val) => {
        // Check for potential injection patterns
        const dangerousPatterns = [
            /<script[^>]*>[\s\S]*?<\/script>/gi,
            /javascript\s*:/i,
            /on\w+\s*=/i,
            /\$\w+\(/i, // NoSQL patterns
            /(union|select|insert|update|delete|drop|create|alter)\s+/i,
        ];
        return !dangerousPatterns.some((pattern) => pattern.test(val));
    }, "Input contains potentially malicious content")
        .optional(),
    fields: z.array(FormFieldSchema).min(1).max(200),
    approvalSteps: z.array(TemplateApprovalStepSchema).min(1).max(10),
    visibleToRoles: z.array(sanitizedString(64)).min(1).max(50),
    active: z.boolean().default(true),
    // Allow application creators to select approvers from user groups
    allowApplicationCreatorsToSelectApprover: z.boolean().default(false),
    // User groups from which application creators can select approvers
    approverSelectionUserGroups: z.array(sanitizedString(64)).default([]),
})
    .strict();
export const FormTemplateUpdateSchema = FormTemplateCreateSchema.partial().strict();
// DB model for FormTemplate (what is stored in DynamoDB)
export const FormTemplateModelSchema = z
    .object({
    id: z.string().min(1).max(64),
    title: z.string().min(2).max(64),
    description: z.string().max(1024).optional(),
    // We keep fields loosely typed to allow backend/frontend to evolve independently
    fields: z.array(z.any()),
    approvalSteps: z.array(TemplateApprovalStepSchema).min(1).max(10),
    visibleToRoles: z.array(z.string()).min(1).max(50),
    active: z.boolean(),
    version: z.number().int().min(1),
    createdAt: z.string(),
    updatedAt: z.string(),
    // Allow application creators to select approvers from user groups
    allowApplicationCreatorsToSelectApprover: z.boolean().default(false),
    // User groups from which application creators can select approvers
    approverSelectionUserGroups: z.array(z.string()).default([]),
})
    .strict();
// ========= Applications =========
// Application step schema (for actual applications)
export const ApplicationStepSchema = z
    .object({
    type: ApprovalStepType,
    role: z.string().min(2).max(64).optional(), // Required for USER_GROUP and DYNAMIC_USER
    user: UserInfoSchema.optional(), // Required for FIXED_USER
    label: z.string().min(2).max(128).optional(), // Required for DYNAMIC_USER
    status: z.enum(["APPROVED", "REJECTED", "PENDING_APPROVAL"]),
    statusText: z.string().max(1024).optional(),
    updatedAt: z.string().optional(),
    updatedById: z.string().min(1).max(64).optional(),
    updatedByFullName: z.string().min(1).max(128).optional(),
})
    .strict();
// Create / Update DTOs stay the same (they’ll accept steps with/without updatedAt)
export const ApplicationCreateSchema = z
    .object({
    userId: z.string().min(1).max(64),
    formId: z.string().min(1).max(64),
    formTitle: z.string().min(1).max(256),
    formVersion: z.number().int().min(1).optional(),
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
    entity: z.enum(["USER", "FORM_TEMPLATE", "APPLICATION", "FILE_UPLOAD"]),
    entityId: id,
    actorUserId: id,
    action: z.enum([
        "CREATE",
        "UPDATE",
        "DELETE",
        "APPROVE",
        "REJECT",
        "SUBMIT",
        "PRESIGN_REQUEST",
    ]),
    changed: z.record(z.string(), z.any()).optional(),
    createdAt: z.string(), // or datetime() if you store ISO
})
    .strict();
export const PresignUploadSchema = z
    .object({
    contentType: z.string().min(1),
    fileName: z.string().min(1).max(255),
    fileSize: z
        .number()
        .min(1)
        .max(10 * 1024 * 1024), // 10MB max
})
    .strict();
