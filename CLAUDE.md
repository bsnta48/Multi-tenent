# next-api

Multi-tenant SaaS backend built as an API-first Next.js app (no real UI).

## Commands

```bash
pnpm dev          # start dev server
pnpm build        # production build
pnpm lint         # eslint
pnpm dlx prisma migrate dev   # run migrations
pnpm dlx prisma generate      # regenerate client after schema changes
```

## Architecture

### Stack
- Next.js 16.1.6 App Router, TypeScript, pnpm
- Zod v4 for request validation
- Upstash Redis (`@upstash/redis`) — primary active store
- MySQL via Prisma — schema + migrations exist, not yet wired to route handlers

### Storage strategy
Redis is the active data layer. Tenant and user records are stored as Redis hashes keyed by `tenent:<subdomain>` and `user:<username>`. Prisma/MySQL is scaffolded (schema, migrations, singleton client in `lib/prisma.ts`) but not used in any route yet — it is the intended durable store.

### Multi-tenancy
Each tenant is identified by a subdomain derived from the tenant name (lowercased, non-alphanumeric chars stripped). Routes receive a `tenentId` field in the request body to scope operations to a tenant. Note: the codebase uses the spelling **"tenent"** (not "tenant") — keep this consistent.

### Route handler pattern
Handlers live at `app/api/<route-name>/route.ts` and export named HTTP method functions. Use `Response.json()` for all responses. Validate with `zod.safeParse()` before any I/O.

```ts
export async function POST(request: Request) {
  const body = await request.json();
  const validated = schema.safeParse(body);
  if (!validated.success) {
    return Response.json({ success: false, message: validated.error.issues[0].message }, { status: 400 });
  }
  // ... redis / prisma calls
  return Response.json({ success: true, message: "..." }, { status: 201 });
}
```

### Environment variables
```
REDIS_URL=
REDIS_TOKEN=
DATABASE_URL=   # MySQL, required for Prisma
```

## Current state of routes

| Route | Status | Notes |
|-------|--------|-------|
| `POST /api/create-tenent` | Working | Writes to Redis; no Prisma write yet |
| `POST /api/sign-up` | Incomplete | Validation done; hits `return` before Redis/Prisma logic (unreachable code below) |
| `POST /api/forgot-password` | Stub | Returns success immediately; no email sending wired |

## Prisma schema

Two models: `User` (id, email, name, password, tenentId, timestamps) and `Tenent` (id, subdomain unique, timestamps, users relation). Generated client outputs to `generated/prisma/`. Import from `@/generated/prisma/client`.
