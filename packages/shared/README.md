# UniApply Shared Package

Shared TypeScript types, validation schemas, and utilities used across the UniApply frontend and backend applications.

## 🎯 Purpose

This package provides a single source of truth for:

- **Type definitions** - Shared interfaces and types
- **Validation schemas** - Zod schemas for data validation
- **Constants** - Shared application constants
- **Utilities** - Common utility functions

## 📦 Installation

```bash
# Install in the root project
npm install @uniapply/shared

# Or build from source
npm run -w @uniapply/shared build
```

## 🏗️ Architecture

### Package Structure

```
packages/shared/
├── src/
│   ├── index.ts           # Main exports
│   ├── schemas.ts         # Zod validation schemas
│   ├── types.ts           # TypeScript type definitions
│   ├── constants.ts       # Application constants
│   └── utils.ts           # Utility functions
├── dist/                  # Compiled output
├── package.json
└── tsconfig.json
```

### Build Process

- **TypeScript compilation** - Generates JavaScript and type definitions
- **Zod schema validation** - Runtime type checking
- **Tree shaking** - Optimized bundle size
- **Type exports** - Full TypeScript support

## 📋 Type Definitions

### Core Types

#### User Types

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  dateOfBirth?: string;
  gender?: string;
  studentId: string;
  userOfficialId: string;
  userOfficialType: string;
  address: Address;
  nationality?: string;
  createdAt: string;
  updatedAt: string;
}

interface Address {
  street: string;
  number: string;
  city: string;
  province: string;
  zipCode: string;
  country: string;
}
```

#### Application Types

```typescript
interface Application {
  id: string;
  userId: string;
  formTemplateId: string;
  formTitle: string;
  status: ApplicationStatus;
  data: Record<string, any>;
  approvalSteps: ApprovalStep[];
  currentStep: number;
  createdAt: string;
  updatedAt: string;
}

type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";
```

#### Form Template Types

```typescript
interface FormTemplate {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  approvalSteps: ApprovalStep[];
  visibleRoles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormField {
  name: string;
  label: string;
  description: string;
  inputType: InputType;
  required: boolean;
  options?: string[];
  validation?: ValidationRule[];
}

type InputType =
  | "TEXT"
  | "NUMBER"
  | "EMAIL"
  | "DATE"
  | "SELECT"
  | "CHECKBOX"
  | "FILE";
```

#### Approval Step Types

```typescript
type ApprovalStep =
  | { type: "USER_GROUP"; role: string }
  | {
      type: "FIXED_USER";
      user: { id: string; firstName: string; lastName: string };
    }
  | { type: "DYNAMIC_USER"; role: string; label: string };
```

## 🔍 Validation Schemas

### Zod Schemas

#### User Validation

```typescript
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.string(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  studentId: z.string().min(1),
  userOfficialId: z.string().min(1),
  userOfficialType: z.string(),
  address: AddressSchema,
  nationality: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

#### Application Validation

```typescript
const ApplicationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  formTemplateId: z.string().uuid(),
  formTitle: z.string().min(1),
  status: z.enum(["DRAFT", "SUBMITTED", "PENDING", "APPROVED", "REJECTED"]),
  data: z.record(z.any()),
  approvalSteps: z.array(ApprovalStepSchema),
  currentStep: z.number().int().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

#### Form Template Validation

```typescript
const FormTemplateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(500),
  fields: z.array(FormFieldSchema),
  approvalSteps: z.array(ApprovalStepSchema),
  visibleRoles: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

## 🛠️ Usage

### Frontend Usage

```typescript
import { User, Application, UserSchema } from "@uniapply/shared";

// Type safety
const user: User = {
  id: "123",
  email: "user@example.com",
  // ... other properties
};

// Runtime validation
const validatedUser = UserSchema.parse(userData);
```

### Backend Usage

```typescript
import { ApplicationSchema, FormTemplateSchema } from "@uniapply/shared";

// API request validation
export async function createApplication(event: APIGatewayEvent) {
  const body = JSON.parse(event.body || "{}");
  const validatedData = ApplicationSchema.parse(body);

  // Process validated data
  return await saveApplication(validatedData);
}
```

## 🔧 Development

### Building the Package

```bash
# Build from root
npm run -w @uniapply/shared build

# Build from package directory
cd packages/shared
npm run build
```

### Development Workflow

1. **Update schemas** - Modify `src/schemas.ts`
2. **Update types** - Modify `src/types.ts`
3. **Build package** - `npm run build`
4. **Test changes** - Verify in frontend/backend
5. **Commit changes** - Include in version control

### Version Management

- **Semantic versioning** - Follow semver principles
- **Breaking changes** - Major version bumps
- **Backward compatibility** - Maintain API stability
- **Changelog** - Document all changes

## 📚 API Reference

### Exports

#### Types

```typescript
export type {
  User,
  Application,
  FormTemplate,
  ApprovalStep,
  FormField,
  Address,
  ApplicationStatus,
  InputType,
  // ... other types
};
```

#### Schemas

```typescript
export {
  UserSchema,
  ApplicationSchema,
  FormTemplateSchema,
  ApprovalStepSchema,
  FormFieldSchema,
  AddressSchema,
  // ... other schemas
};
```

#### Utilities

```typescript
export {
  validateEmail,
  formatDate,
  generateId,
  // ... other utilities
};
```

## 🔍 Validation Examples

### Form Data Validation

```typescript
import { FormFieldSchema } from "@uniapply/shared";

const fieldData = {
  name: "studentId",
  label: "Student ID",
  description: "Enter your student identification number",
  inputType: "TEXT",
  required: true,
  validation: [
    { type: "minLength", value: 5 },
    { type: "maxLength", value: 20 },
  ],
};

const validatedField = FormFieldSchema.parse(fieldData);
```

### API Response Validation

```typescript
import { ApplicationSchema } from "@uniapply/shared";

const apiResponse = await fetch("/api/applications/123");
const applicationData = await apiResponse.json();

try {
  const validatedApplication = ApplicationSchema.parse(applicationData);
  // Use validated data
} catch (error) {
  console.error("Invalid application data:", error);
}
```

## 🚀 Best Practices

### Type Safety

- **Use shared types** - Import from this package
- **Avoid type duplication** - Single source of truth
- **Runtime validation** - Use Zod schemas for API data
- **Type guards** - Check types at runtime

### Schema Design

- **Consistent naming** - Follow established patterns
- **Comprehensive validation** - Validate all data
- **Error messages** - Provide helpful error messages
- **Optional fields** - Use `.optional()` for nullable fields

### Performance

- **Tree shaking** - Only import what you need
- **Bundle size** - Keep package lightweight
- **Caching** - Cache validation results
- **Lazy loading** - Load schemas on demand

## 🔧 Troubleshooting

### Common Issues

1. **Type mismatches** - Check schema definitions
2. **Build errors** - Verify TypeScript compilation
3. **Import errors** - Check package exports
4. **Validation failures** - Review Zod schema rules

### Debug Tips

- **Type checking** - Use TypeScript strict mode
- **Runtime validation** - Test with sample data
- **Schema inspection** - Use Zod's `.describe()`
- **Error handling** - Catch and log validation errors

## 📚 Related Documentation

- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Zod Documentation](https://zod.dev/)
- [Frontend Documentation](../frontend/README.md)
- [Backend Documentation](../backend/README.md)
