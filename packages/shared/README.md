# UniApply Shared Package

Shared TypeScript types, validation schemas, and utilities used across the UniApply frontend and backend applications.

## Purpose

This package provides a single source of truth for:

- **Type definitions** - Shared interfaces and types
- **Validation schemas** - Zod schemas for data validation
- **Constants** - Shared application constants
- **Utilities** - Common utility functions

## Installation

```bash
# Install in the root project
npm install @uniapply/shared

# Or build from source
npm run -w @uniapply/shared build
```

## Architecture

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

## Usage

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

## Related Documentation

- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Zod Documentation](https://zod.dev/)
