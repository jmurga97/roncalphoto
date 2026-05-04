# @roncal/api

REST API for the RoncalPhoto photography portfolio. Built as a Cloudflare Worker using Hono, Drizzle ORM, and Zod OpenAPI.

## Package purpose

This package exposes the public REST API consumed by:
- `@roncal/photos-app` (public portfolio frontend)
- `@roncal/photos-admin` (protected admin dashboard)
- `@roncal/email-worker` (OTP delivery for admin auth)

It handles CRUD for sessions, photos, and tags, plus a custom OTP-based authentication flow for the admin panel.

## Internal dependencies

| Package | Why it is used |
|---------|----------------|
| `@roncal/shared` | Canonical domain types (`ApiPhoto`, `ApiSession`, `Tag`, etc.) and `normalizePhotoMetadata`. Ensures the API and frontends speak the same type language. |
| `@roncal/auth` | OTP generation, session token hashing, KV store primitives, and cookie constants for the custom auth implementation. |

## Folder structure

```
src/
├── index.ts                 # Worker entry point (fetch handler)
├── app/
│   ├── create-app.ts        # OpenAPIHono factory: middleware, CORS, auth mount, error handlers
│   ├── routes.ts            # Registers /api/sessions, /api/photos, /api/tags
│   └── middlewares/
│       └── cors.ts          # General CORS middleware (skips /api/auth/*)
├── auth.ts                  # Custom auth handler: OTP send/sign-in, cookie sessions, email worker client
├── config/
│   ├── env.ts               # Zod-based env parsing (public + auth bindings)
│   ├── types.ts             # Hono context bindings and route handler types
│   ├── handlers.ts          # Validation hook, not-found, and error handlers
│   ├── pino-logger.ts       # Hono-Pino logger factory
│   ├── status-codes.ts      # Named HTTP status constants
│   └── config-open-api.ts   # OpenAPI document registration
├── db/
│   ├── index.ts             # Drizzle D1 factory + WeakMap instance cache
│   └── schema/
│       ├── index.ts         # Domain tables (tags, sessions, sessionTags, photos, photoUploadJobs)
│       └── auth.ts          # Better-Auth tables for Drizzle Kit migrations
├── modules/
│   ├── sessions/            # Routes, schemas, service, repository
│   ├── photos/              # Routes, schemas, service (direct DB access)
│   └── tags/                # Routes, schemas, service (direct DB access)
└── shared/
    ├── lib/
    │   ├── http.ts          # Response helpers, OpenAPI error response factories
    │   ├── openapi.ts       # createApiRoute / createOpenApiRouter wrappers
    │   ├── api-mappers.ts   # DB row <-> API type converters
    │   ├── session-relations.ts # Batch loaders for tags/photos by session IDs
    │   ├── instance-cache.ts    # WeakMap-based singleton helper
    │   ├── collections.ts       # groupValuesBy helper
    │   ├── validation.ts        # Zod error message formatter
    │   └── contracts.ts         # Zod schemas for OpenAPI documentation
    ├── errors/
    │   ├── http-error.ts    # HttpError class
    │   └── map-error.ts     # Maps Zod/unknown errors to HttpError
    └── utils/
        ├── id.ts            # crypto.randomUUID wrapper
        └── slug.ts          # slugify and collision resolution
```

## Architecture

The API uses **Hono** with **`@hono/zod-openapi`** for request validation and auto-generated OpenAPI docs.

### Layers

| Layer | Responsibility |
|-------|----------------|
| **Routes** (`modules/*/routes/*.ts`) | Define OpenAPI route metadata (method, path, Zod schemas, error responses) and wire handlers. |
| **Services** (`modules/*/services/*.service.ts`) | Orchestrate business logic, hydrate related data, and enforce rules (e.g. unique slug generation). |
| **Repository** (`modules/sessions/repositories/`) | Encapsulates Drizzle queries and transactions. Only the sessions module uses a repository; photos and tags access the DB directly. |
| **DB** (`db/`) | Drizzle ORM schemas and D1 client factory. |
| **Shared** (`shared/`) | Cross-cutting concerns: error types, mappers, utilities, and OpenAPI helpers. |

### Patterns

- **Singleton-per-D1Database**: Services and repositories are cached in a `WeakMap<D1Database, Instance>` so repeated requests reuse the same objects without manual lifecycle management.
- **Response envelope**: Every JSON response follows `{ success: true, data: ... }` or `{ success: false, error: ... }`.

## Request lifecycle

1. **Cloudflare Worker** receives the request and invokes `src/index.ts`.
2. **`createApp()`** mounts global middleware:
   - Pino logger
   - Env parsing (`parseEnv`)
   - CORS (dedicated middleware for `/api/auth/*`, general middleware for everything else)
3. **Auth routes** (`/api/auth/*`) are handled by `src/auth.ts`, which dispatches to OTP or session handlers.
4. **Business routes** hit `registerRoutes(app)`:
   - Hono validates params, query, and body against Zod schemas.
   - If validation fails, `defaultValidationHook` returns a `400` with a formatted message.
   - The route handler calls a **Service** (e.g. `SessionsService`).
   - The service may call a **Repository** or Drizzle directly.
   - The service returns domain types (`ApiSession`, `ApiPhoto`, etc.).
   - The route handler wraps the result in `jsonSuccess(...)` and returns it.
5. **Errors** bubble to `onErrorHandler`:
   - `HttpError` → returns the mapped status and message.
   - `ZodError` → converted to `400`.
   - Unknown errors → `500`; stack traces are included only in non-production environments.

## Configuration

### Required environment variables / bindings

| Name | Type | Purpose |
|------|------|---------|
| `DB_RONCALPHOTO` | D1Database binding | Main database for sessions, photos, and tags. |
| `ALLOWED_ORIGINS` | string (optional) | Comma-separated list of additional CORS origins. Localhost origins are always allowed in development. |
| `LOG_LEVEL` | string | Pino log level (`trace`…`fatal`). Defaults to `info`. |
| `NODE_ENV` | string | `development`, `test`, or `production`. Defaults to `development`. |
| `BETTER_AUTH_SECRET` | string | Secret for OTP/session token hashing. |
| `PHOTOS_ADMIN_URL` | string | Canonical admin frontend origin (used for auth CORS). |
| `EMAIL_WORKER` | Service binding (optional) | Direct binding to the email worker for OTP delivery. |
| `EMAIL_WORKER_URL` | string (optional) | Fallback URL for the email worker in local development. |
| `EMAIL_WORKER_API_KEY` | string (optional) | API key for the fallback email worker URL. |
| `AUTH_KV` | KVNamespace binding | KV store for OTP records and session tokens. |

> **Auth requirement**: either the `EMAIL_WORKER` service binding **or** both `EMAIL_WORKER_URL` and `EMAIL_WORKER_API_KEY` must be provided.

## Available scripts

```bash
# Development
bun run dev                 # Apply local D1 migrations and start Wrangler dev server on :8787

# Building / Deploying
bun run build               # Dry-run Wrangler deploy to ./dist
bun run deploy              # Deploy to Cloudflare (applies remote migrations first)

# Database
bun run db:migrate:local    # Apply D1 migrations locally
bun run db:migrate:remote   # Apply D1 migrations remotely
bun run db:generate         # Generate Drizzle migrations
bun run db:studio           # Open Drizzle Studio

# Types / Checks
bun run cf-typegen          # Regenerate Wrangler worker types
bun run check               # Run TypeScript type check
```

## Relevant technical decisions

1. **Custom auth instead of Better Auth endpoints**  
   The package uses `@roncal/auth` primitives (OTP generation, token hashing, KV helpers) but implements its own HTTP handlers in `src/auth.ts`. This keeps the auth flow lightweight and tightly coupled to the email worker, but means auth tables in `db/schema/auth.ts` are only used for Drizzle Kit migrations, not runtime queries.

2. **Sessions use a repository; photos and tags do not**  
   The sessions module has a full repository layer (`SessionsRepository`) because it manages cross-table transactions (session + session_tags). Photos and tags operate on single tables, so their services query Drizzle directly. This inconsistency is intentional: a repository is introduced only when multi-table transactions are needed.

3. **WeakMap singletons**  
   `getOrCreateInstance` caches DB, service, and repository instances per `D1Database` object. In the Worker runtime this avoids recreating Drizzle instances on every request without requiring global mutable state.

4. **Raw D1 SQL in auth**  
   `src/auth.ts` queries the `user` table with raw `c.env.DB_RONCALPHOTO.prepare(...)` instead of Drizzle. This is a historical inconsistency relative to the rest of the codebase; changing it would require refactoring the auth module to use Drizzle and the auth schema, which is a larger architectural change.

5. **Pre-existing type issues**  
   `c.req.valid("json")`, `c.req.valid("param")`, and `c.req.valid("query")` currently infer as `never` in several route files due to a known type-level mismatch in the installed versions of `@hono/zod-openapi` and `zod`. These errors exist in the original codebase and do not affect runtime behavior.
