import { z } from "zod";
export declare const OfficialIdType: z.ZodEnum<{
    ID: "ID";
    PASSPORT: "PASSPORT";
    DRIVING_LICENCE: "DRIVING_LICENCE";
    OTHER: "OTHER";
}>;
export declare const AppStatus: z.ZodEnum<{
    DRAFT: "DRAFT";
    APPROVED: "APPROVED";
    REJECTED: "REJECTED";
    PENDING_APPROVAL: "PENDING_APPROVAL";
}>;
export declare const StepStatus: z.ZodEnum<{
    APPROVED: "APPROVED";
    REJECTED: "REJECTED";
    PENDING_APPROVAL: "PENDING_APPROVAL";
}>;
export declare const FieldInputType: z.ZodEnum<{
    TEXT: "TEXT";
    LONG_TEXT: "LONG_TEXT";
    NUMBER: "NUMBER";
    FILE: "FILE";
    DATE: "DATE";
    SELECT: "SELECT";
    CHECKBOX: "CHECKBOX";
}>;
export declare const AddressSchema: z.ZodObject<{
    street: z.ZodOptional<z.ZodString>;
    number: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    province: z.ZodOptional<z.ZodString>;
    zipCode: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const RoleAccessSchema: z.ZodObject<{
    canCreateFormTemplates: z.ZodBoolean;
    canCreateApplications: z.ZodBoolean;
    canApproveForms: z.ZodBoolean;
    canModifyApplicationSettings: z.ZodBoolean;
    canModifyUserData: z.ZodBoolean;
    canViewApplications: z.ZodBoolean;
    canViewAllApplications: z.ZodBoolean;
    canViewAllFormTemplates: z.ZodBoolean;
    canViewAllUsers: z.ZodBoolean;
    canModifyUserRoleAccess: z.ZodBoolean;
}, z.core.$strict>;
export declare const RoleSchema: z.ZodObject<{
    roleName: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    access: z.ZodObject<{
        canCreateFormTemplates: z.ZodBoolean;
        canCreateApplications: z.ZodBoolean;
        canApproveForms: z.ZodBoolean;
        canModifyApplicationSettings: z.ZodBoolean;
        canModifyUserData: z.ZodBoolean;
        canViewApplications: z.ZodBoolean;
        canViewAllApplications: z.ZodBoolean;
        canViewAllFormTemplates: z.ZodBoolean;
        canViewAllUsers: z.ZodBoolean;
        canModifyUserRoleAccess: z.ZodBoolean;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const RoleModelSchema: z.ZodObject<{
    roleName: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    access: z.ZodObject<{
        canCreateFormTemplates: z.ZodBoolean;
        canCreateApplications: z.ZodBoolean;
        canApproveForms: z.ZodBoolean;
        canModifyApplicationSettings: z.ZodBoolean;
        canModifyUserData: z.ZodBoolean;
        canViewApplications: z.ZodBoolean;
        canViewAllApplications: z.ZodBoolean;
        canViewAllFormTemplates: z.ZodBoolean;
        canViewAllUsers: z.ZodBoolean;
        canModifyUserRoleAccess: z.ZodBoolean;
    }, z.core.$strict>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strict>;
export declare const UserBase: z.ZodObject<{
    role: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    studentId: z.ZodString;
    userOfficialId: z.ZodString;
    userOfficialType: z.ZodEnum<{
        ID: "ID";
        PASSPORT: "PASSPORT";
        DRIVING_LICENCE: "DRIVING_LICENCE";
        OTHER: "OTHER";
    }>;
    tel: z.ZodString;
    email: z.ZodEmail;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodOptional<z.ZodString>;
        number: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        province: z.ZodOptional<z.ZodString>;
        zipCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    active: z.ZodDefault<z.ZodBoolean>;
    verified: z.ZodDefault<z.ZodBoolean>;
    settings: z.ZodOptional<z.ZodObject<{
        dark: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, z.core.$strip>>;
}, z.core.$strict>;
export declare const UserCreateSchema: z.ZodObject<{
    role: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    studentId: z.ZodString;
    userOfficialId: z.ZodString;
    userOfficialType: z.ZodEnum<{
        ID: "ID";
        PASSPORT: "PASSPORT";
        DRIVING_LICENCE: "DRIVING_LICENCE";
        OTHER: "OTHER";
    }>;
    tel: z.ZodString;
    email: z.ZodEmail;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodOptional<z.ZodString>;
        number: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        province: z.ZodOptional<z.ZodString>;
        zipCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    active: z.ZodDefault<z.ZodBoolean>;
    verified: z.ZodDefault<z.ZodBoolean>;
    settings: z.ZodOptional<z.ZodObject<{
        dark: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, z.core.$strip>>;
}, z.core.$strict>;
export declare const UserUpdateSchema: z.ZodObject<{
    role: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    studentId: z.ZodOptional<z.ZodString>;
    userOfficialId: z.ZodOptional<z.ZodString>;
    userOfficialType: z.ZodOptional<z.ZodEnum<{
        ID: "ID";
        PASSPORT: "PASSPORT";
        DRIVING_LICENCE: "DRIVING_LICENCE";
        OTHER: "OTHER";
    }>>;
    tel: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
    address: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        street: z.ZodOptional<z.ZodString>;
        number: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        province: z.ZodOptional<z.ZodString>;
        zipCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>>;
    active: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    verified: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    settings: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        dark: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, z.core.$strip>>>;
}, z.core.$strict>;
export declare const UserCreateMinimalSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodEmail;
}, z.core.$strict>;
export declare const UserModelSchema: z.ZodObject<{
    role: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    studentId: z.ZodString;
    userOfficialId: z.ZodString;
    userOfficialType: z.ZodEnum<{
        ID: "ID";
        PASSPORT: "PASSPORT";
        DRIVING_LICENCE: "DRIVING_LICENCE";
        OTHER: "OTHER";
    }>;
    tel: z.ZodString;
    email: z.ZodEmail;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodOptional<z.ZodString>;
        number: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        province: z.ZodOptional<z.ZodString>;
        zipCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    active: z.ZodDefault<z.ZodBoolean>;
    verified: z.ZodDefault<z.ZodBoolean>;
    settings: z.ZodOptional<z.ZodObject<{
        dark: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, z.core.$strip>>;
    id: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strict>;
export declare const ValidationRuleSchema: z.ZodObject<{
    rule: z.ZodEnum<{
        email: "email";
        required: "required";
        min: "min";
        max: "max";
        regex: "regex";
        e164: "e164";
        enum: "enum";
    }>;
    value: z.ZodOptional<z.ZodAny>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const FormFieldSchema: z.ZodObject<{
    name: z.ZodString;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    inputType: z.ZodEnum<{
        TEXT: "TEXT";
        LONG_TEXT: "LONG_TEXT";
        NUMBER: "NUMBER";
        FILE: "FILE";
        DATE: "DATE";
        SELECT: "SELECT";
        CHECKBOX: "CHECKBOX";
    }>;
    validationRules: z.ZodDefault<z.ZodArray<z.ZodObject<{
        rule: z.ZodEnum<{
            email: "email";
            required: "required";
            min: "min";
            max: "max";
            regex: "regex";
            e164: "e164";
            enum: "enum";
        }>;
        value: z.ZodOptional<z.ZodAny>;
        message: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>>;
    defaultValue: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    options: z.ZodOptional<z.ZodUnion<readonly [z.ZodArray<z.ZodString>, z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        value: z.ZodString;
    }, z.core.$strict>>]>>;
}, z.core.$strict>;
export declare const FormTemplateCreateSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    fields: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        label: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        inputType: z.ZodEnum<{
            TEXT: "TEXT";
            LONG_TEXT: "LONG_TEXT";
            NUMBER: "NUMBER";
            FILE: "FILE";
            DATE: "DATE";
            SELECT: "SELECT";
            CHECKBOX: "CHECKBOX";
        }>;
        validationRules: z.ZodDefault<z.ZodArray<z.ZodObject<{
            rule: z.ZodEnum<{
                email: "email";
                required: "required";
                min: "min";
                max: "max";
                regex: "regex";
                e164: "e164";
                enum: "enum";
            }>;
            value: z.ZodOptional<z.ZodAny>;
            message: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>>;
        defaultValue: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        options: z.ZodOptional<z.ZodUnion<readonly [z.ZodArray<z.ZodString>, z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodString;
        }, z.core.$strict>>]>>;
    }, z.core.$strict>>;
    approvalSteps: z.ZodArray<z.ZodObject<{
        role: z.ZodString;
    }, z.core.$strict>>;
    visibleToRoles: z.ZodArray<z.ZodString>;
    active: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
export declare const FormTemplateUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    fields: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        label: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        inputType: z.ZodEnum<{
            TEXT: "TEXT";
            LONG_TEXT: "LONG_TEXT";
            NUMBER: "NUMBER";
            FILE: "FILE";
            DATE: "DATE";
            SELECT: "SELECT";
            CHECKBOX: "CHECKBOX";
        }>;
        validationRules: z.ZodDefault<z.ZodArray<z.ZodObject<{
            rule: z.ZodEnum<{
                email: "email";
                required: "required";
                min: "min";
                max: "max";
                regex: "regex";
                e164: "e164";
                enum: "enum";
            }>;
            value: z.ZodOptional<z.ZodAny>;
            message: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>>;
        defaultValue: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        options: z.ZodOptional<z.ZodUnion<readonly [z.ZodArray<z.ZodString>, z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodString;
        }, z.core.$strict>>]>>;
    }, z.core.$strict>>>;
    approvalSteps: z.ZodOptional<z.ZodArray<z.ZodObject<{
        role: z.ZodString;
    }, z.core.$strict>>>;
    visibleToRoles: z.ZodOptional<z.ZodArray<z.ZodString>>;
    active: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, z.core.$strict>;
export declare const FormTemplateModelSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    fields: z.ZodArray<z.ZodAny>;
    approvalSteps: z.ZodArray<z.ZodObject<{
        role: z.ZodString;
        stepOrder: z.ZodNumber;
    }, z.core.$strict>>;
    visibleToRoles: z.ZodArray<z.ZodString>;
    active: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strict>;
export declare const ApplicationStepSchema: z.ZodObject<{
    role: z.ZodString;
    status: z.ZodEnum<{
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
        PENDING_APPROVAL: "PENDING_APPROVAL";
    }>;
    statusText: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
    updatedByEmail: z.ZodOptional<z.ZodEmail>;
}, z.core.$strict>;
export declare const ApplicationCreateSchema: z.ZodObject<{
    userId: z.ZodString;
    formId: z.ZodString;
    fields: z.ZodRecord<z.ZodString, z.ZodAny>;
    approvalSteps: z.ZodArray<z.ZodObject<{
        role: z.ZodString;
        status: z.ZodEnum<{
            APPROVED: "APPROVED";
            REJECTED: "REJECTED";
            PENDING_APPROVAL: "PENDING_APPROVAL";
        }>;
        statusText: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodOptional<z.ZodString>;
        updatedByEmail: z.ZodOptional<z.ZodEmail>;
    }, z.core.$strict>>;
    status: z.ZodDefault<z.ZodEnum<{
        DRAFT: "DRAFT";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
        PENDING_APPROVAL: "PENDING_APPROVAL";
    }>>;
}, z.core.$strict>;
export declare const ApplicationUpdateSchema: z.ZodObject<{
    fields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    approvalSteps: z.ZodOptional<z.ZodArray<z.ZodObject<{
        role: z.ZodString;
        status: z.ZodEnum<{
            APPROVED: "APPROVED";
            REJECTED: "REJECTED";
            PENDING_APPROVAL: "PENDING_APPROVAL";
        }>;
        statusText: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodOptional<z.ZodString>;
        updatedByEmail: z.ZodOptional<z.ZodEmail>;
    }, z.core.$strict>>>;
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
        PENDING_APPROVAL: "PENDING_APPROVAL";
    }>>;
}, z.core.$strict>;
export declare const ApplicationModelSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    formId: z.ZodString;
    fields: z.ZodRecord<z.ZodString, z.ZodAny>;
    approvalSteps: z.ZodArray<z.ZodObject<{
        role: z.ZodString;
        status: z.ZodEnum<{
            APPROVED: "APPROVED";
            REJECTED: "REJECTED";
            PENDING_APPROVAL: "PENDING_APPROVAL";
        }>;
        statusText: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodOptional<z.ZodString>;
        updatedByEmail: z.ZodOptional<z.ZodEmail>;
    }, z.core.$strict>>;
    status: z.ZodEnum<{
        DRAFT: "DRAFT";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
        PENDING_APPROVAL: "PENDING_APPROVAL";
    }>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strict>;
export declare const AuditLogSchema: z.ZodObject<{
    id: z.ZodString;
    entity: z.ZodEnum<{
        USER: "USER";
        FORM_TEMPLATE: "FORM_TEMPLATE";
        APPLICATION: "APPLICATION";
    }>;
    entityId: z.ZodString;
    actorUserId: z.ZodString;
    action: z.ZodEnum<{
        CREATE: "CREATE";
        UPDATE: "UPDATE";
        DELETE: "DELETE";
        APPROVE: "APPROVE";
        REJECT: "REJECT";
        SUBMIT: "SUBMIT";
    }>;
    changed: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodString;
}, z.core.$strict>;
export declare const PresignUploadSchema: z.ZodObject<{
    contentType: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type Role = z.infer<typeof RoleSchema>;
export type RoleModel = z.infer<typeof RoleModelSchema>;
export type User = z.infer<typeof UserModelSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type UserCreateMinimal = z.infer<typeof UserCreateMinimalSchema>;
export type FormTemplate = z.infer<typeof FormTemplateModelSchema>;
export type FormTemplateCreate = z.infer<typeof FormTemplateCreateSchema>;
export type FormTemplateUpdate = z.infer<typeof FormTemplateUpdateSchema>;
export type Application = z.infer<typeof ApplicationModelSchema>;
export type ApplicationStatus = z.infer<typeof ApplicationModelSchema>["status"];
export type ApplicationStep = z.infer<typeof ApplicationStepSchema>;
export type ApplicationUpdate = z.infer<typeof ApplicationUpdateSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
export type PresignUpload = z.infer<typeof PresignUploadSchema>;
