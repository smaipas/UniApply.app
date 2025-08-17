export type RoleAccess = {
  canCreateFormTemplates: boolean;
  canCreateApplications: boolean;
  canApproveForms: boolean;
  canModifyApplicationSettings: boolean;
  canModifyUserData: boolean;
  canViewApplications: boolean;
  canViewAllApplications: boolean;
};

export type Role = {
  roleName: string;
  access: RoleAccess;
  createdAt: string;
  updatedAt: string;
};

export type Address = {
  street?: string;
  number?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  country?: string;
};

export type UserSettings = {
  dark: boolean;
  language: string;
  notificationsEnabled: boolean;
};

export type User = {
  id: string;
  role?: string;
  firstName: string;
  lastName: string;
  studentId?: number;
  userOfficialId?: string;
  userOfficialType?: string;
  tel?: string;
  email?: string;
  address?: Address;
  active: boolean;
  verified: boolean;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
};

export type ValidationRules = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  regex?: string;
  allowedValues?: string[];
  fileTypes?: string[];
  maxFileSizeMB?: number;
};

export type FormField = {
  name: string;
  label: string;
  description?: string;
  inputType:
    | "TEXT"
    | "LONG_TEXT"
    | "NUMBER"
    | "DATE"
    | "DATETIME"
    | "BOOLEAN"
    | "FILE"
    | "SELECT"
    | "MULTI_SELECT";
  validationRules?: ValidationRules;
};

export type FormTemplate = {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  approvalSteps: { role: string; stepOrder: number }[];
  visibleToRoles: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationStep = {
  role: string;
  status: "APPROVED" | "REJECTED" | "PENDING_APPROVAL";
  statusText?: string;
  updatedAt?: string;
};

export type ApplicationStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED";

export type Application = {
  id: string;
  userId: string;
  formId: string;
  fields: Record<string, any>;
  approvalSteps: ApplicationStep[];
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};
