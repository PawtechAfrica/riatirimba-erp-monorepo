# ERP SDK (`@erp/sdk`) Architecture & Usage Guide for AI Agents and Developers

## 1. Overview & Purpose

The `@erp/sdk` package is a **capability-oriented library** that provides reusable data schemas, formatters, server utilities, HTTP clients, and frontend tools for the RIATIRIMBA TVC ERP platform.

### Core Design Rules
* **Organized by Capability, Not Backend Services**: The SDK is structured by runtime and capability (`shared/*`, `server/*`, `frontend/*`), not by backend microservice names.
* **Explicit Capability Imports**: Consumers must import exact capability subpaths. Monolithic root imports (`import { ... } from '@erp/sdk'`) are forbidden.
* **Strict Runtime Boundaries**: Browser/React code cannot import server capabilities (`@erp/sdk/server/*`). Server code cannot import frontend capabilities (`@erp/sdk/frontend/*`).

---

## 2. Directory Structure & Capabilities Map

```text
@erp/sdk
├── shared/                  # Code safe for both Frontend & Server
│   ├── schemas/             # Zod validation schemas (Admission, Auth, Enrollment, etc.)
│   ├── formatters/          # Pure text & name formatters
│   ├── enums/               # Shared domain enums
│   ├── types/               # Common API types & PaginatedResult interfaces
│   └── utils/               # Pure utilities (RegEx, string parsing)
│
├── server/                  # Server-only functionality (Node.js/Express/NestJS)
│   ├── http/                # BaseServiceClient & HTTP client abstractions
│   ├── logging/             # Logger factory (createServiceLogger)
│   └── auth/                # Server authentication & permission middlewares
│
└── frontend/                # Browser & React-only functionality
    └── utils/               # LocalStorage helpers, DOM utilities
```

---

## 3. Allowed and Forbidden Imports

### For Frontend Applications (`frontends/admin`, `frontends/admission`, `frontends/student-portal`)

#### Allowed:
```typescript
import { AdmissionFormSchema } from "@erp/sdk/shared/schemas";
import { formatFullName } from "@erp/sdk/shared/formatters";
import { getStorageItem } from "@erp/sdk/frontend/utils";
```

#### Forbidden:
```typescript
// ❌ FORBIDDEN: Monolithic root import
import { formatFullName } from "@erp/sdk";

// ❌ FORBIDDEN: Importing server code into frontend
import { createServiceLogger } from "@erp/sdk/server/logging";

// ❌ FORBIDDEN: Importing internal implementation files directly
import { BaseServiceClient } from "@erp/sdk/server/http/index.js";
```

---

### For Backend Services (`services/*`)

#### Allowed:
```typescript
import { ServiceHealthStatus, APIResponse } from "@erp/sdk/shared/types";
import { createServiceLogger } from "@erp/sdk/server/logging";
import { BaseServiceClient } from "@erp/sdk/server/http";
```

#### Forbidden:
```typescript
// ❌ FORBIDDEN: Monolithic root import
import { createServiceLogger } from "@erp/sdk";

// ❌ FORBIDDEN: Importing frontend browser code into backend microservice
import { getStorageItem } from "@erp/sdk/frontend/utils";
```

---

## 4. Capability Documentation

### `@erp/sdk/shared/schemas`
- **Purpose**: Zod schemas for validating input payloads, DTOs, and request params.
- **Intended Consumers**: Frontend forms, API request validators in backend services.
- **Usage Example**:
  ```typescript
  import { admissionFormSchema } from "@erp/sdk/shared/schemas";
  const result = admissionFormSchema.safeParse(req.body);
  ```

### `@erp/sdk/shared/formatters`
- **Purpose**: Pure formatting functions (names, currency, phone numbers).
- **Intended Consumers**: Both Frontend and Server.
- **Usage Example**:
  ```typescript
  import { formatFullName } from "@erp/sdk/shared/formatters";
  const name = formatFullName("John", "Doe");
  ```

### `@erp/sdk/server/http`
- **Purpose**: Base class for constructing HTTP clients that communicate between services.
- **Intended Consumers**: Backend microservices only.
- **Usage Example**:
  ```typescript
  import { BaseServiceClient } from "@erp/sdk/server/http";
  
  export class AuthServiceClient extends BaseServiceClient {
    async checkToken(token: string) {
      const url = this.getEndpointUrl('/verify');
      // fetch logic
    }
  }
  ```

### `@erp/sdk/server/logging`
- **Purpose**: Standardized structured logger factory for backend microservices.
- **Intended Consumers**: Backend microservices only.
- **Usage Example**:
  ```typescript
  import { createServiceLogger } from "@erp/sdk/server/logging";
  const logger = createServiceLogger("AuthService");
  logger.info("Server started on port 4000");
  ```

---

## 5. How to Add a New SDK Capability

When adding new functionality to `@erp/sdk`:

1. **Determine Runtime Boundary**:
   - Pure JS logic/types with no environment dependencies -> `src/shared/<capability>/`
   - Depends on Node.js, Express, DB drivers, or server APIs -> `src/server/<capability>/`
   - Depends on Browser DOM, React, or LocalStorage -> `src/frontend/<capability>/`

2. **Create Capability Entrypoint**:
   - Create a directory `src/<runtime>/<capability>/` with an `index.ts` file that exports the public API.

3. **Register in `tsup.config.ts`**:
   ```typescript
   entry: {
     // ...
     "<runtime>/<capability>/index": "./src/<runtime>/<capability>/index.ts"
   }
   ```

4. **Register in `package.json` Exports Map**:
   ```json
   "./<runtime>/<capability>": {
     "types": "./dist/<runtime>/<capability>/index.d.ts",
     "import": "./dist/<runtime>/<capability>/index.js",
     "require": "./dist/<runtime>/<capability>/index.cjs"
   }
   ```

5. **Build and Test**:
   - Run `npx tsup` inside `erp-sdk` to verify `.js`, `.cjs`, and `.d.ts` generation.
