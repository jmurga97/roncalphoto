# @roncal/api

REST API for the RoncalPhoto photography portfolio. Built as a Cloudflare Worker using Hono, Drizzle ORM, and Zod OpenAPI.

## Package purpose

This package exposes the public REST API consumed by:

- `@roncal/photos-app` (public portfolio frontend)
- `@roncal/photos-admin` (protected admin dashboard)
- `ming-email-worker` through a private service binding (OTP delivery for admin auth)

It handles CRUD for sessions, photos, and tags, plus Better Auth Email OTP authentication for the admin panel.

## Internal dependencies

| Package          | Why it is used                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@roncal/shared` | Canonical domain types (`ApiPhoto`, `ApiSession`, `Tag`, etc.) and `normalizePhotoMetadata`. Ensures the API and frontends speak the same type language. |
| `@roncal/auth`   | Reusable Better Auth factory, Email OTP plugin setup, D1/Drizzle adapter wiring, and email-worker OTP sender helper.                                     |

## Folder structure

```
src/
├── index.ts                 # Worker entry point (fetch handler)
├── app/
│   ├── create-app.ts        # OpenAPIHono factory: middleware, CORS, auth mount, error handlers
│   ├── routes.ts            # Registers /api/sessions, /api/photos, /api/tags
│   └── middlewares/
│       └── cors.ts          # General CORS middleware (skips /api/auth/*)
├── auth.ts                  # Better Auth factory/cache, auth handler, protected-route session middleware
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
│       ├── index.ts         # Domain tables and Better Auth runtime schema exports
│       └── auth.ts          # Better Auth tables: user, session, account, verification
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

| Layer                                             | Responsibility                                                                                                                     |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Routes** (`modules/*/routes/*.ts`)              | Define OpenAPI route metadata (method, path, Zod schemas, error responses) and wire handlers.                                      |
| **Services** (`modules/*/services/*.service.ts`)  | Orchestrate business logic, hydrate related data, and enforce rules (e.g. unique slug generation).                                 |
| **Repository** (`modules/sessions/repositories/`) | Encapsulates Drizzle queries and transactions. Only the sessions module uses a repository; photos and tags access the DB directly. |
| **DB** (`db/`)                                    | Drizzle ORM schemas and D1 client factory.                                                                                         |
| **Shared** (`shared/`)                            | Cross-cutting concerns: error types, mappers, utilities, and OpenAPI helpers.                                                      |

### Patterns

- **Singleton-per-D1Database**: Services and repositories are cached in a `WeakMap<D1Database, Instance>` so repeated requests reuse the same objects without manual lifecycle management.
- **Response envelope**: Domain API JSON responses follow `{ success: true, data: ... }` or `{ success: false, error: ... }`. `/api/auth/*` is delegated to Better Auth and uses Better Auth's native response/cookie contract.

## Request lifecycle

1. **Cloudflare Worker** receives the request and invokes `src/index.ts`.
2. **`createApp()`** mounts global middleware:
   - Pino logger
   - Env parsing (`parseEnv`)
   - CORS (dedicated middleware for `/api/auth/*`, general middleware for everything else)
3. **Auth routes** (`/api/auth/*`) are delegated to `auth.handler(c.req.raw)` from Better Auth.
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

| Name                 | Type               | Purpose                                                                                               |
| -------------------- | ------------------ | ----------------------------------------------------------------------------------------------------- |
| `DB_RONCALPHOTO`     | D1Database binding | Main database for sessions, photos, and tags.                                                         |
| `ALLOWED_ORIGINS`    | string (optional)  | Comma-separated list of additional CORS origins. Localhost origins are always allowed in development. |
| `LOG_LEVEL`          | string             | Pino log level (`trace`…`fatal`). Defaults to `info`.                                                 |
| `NODE_ENV`           | string             | `development`, `test`, or `production`. Defaults to `development`.                                    |
| `BETTER_AUTH_SECRET` | string             | Secret used by Better Auth for signing, hashing, and encryption.                                      |
| `BETTER_AUTH_URL`    | string             | Canonical API origin used by Better Auth. Production uses `https://api.murga.ing`.                    |
| `PHOTOS_ADMIN_URL`   | string             | Canonical admin frontend origin (used for auth CORS).                                                 |
| `EMAIL_WORKER`       | Service binding    | Direct binding to the email worker for OTP delivery.                                                  |

> **Auth requirement**: the `EMAIL_WORKER` service binding must be available whenever `/api/auth/*` is used.

### Cloudflare deploy credentials

`CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` must be configured as
Cloudflare build/deploy environment variables for the `roncalphoto-api` Worker
project when Cloudflare builds deploy this app. They are consumed by Wrangler
for D1 migrations and `bun run deploy`; they must not be added to
`wrangler.toml [vars]`, `.dev.vars`, or runtime secrets.

## Available scripts

```bash
# Development
bun run dev                 # Start local code on :8787 with remote Cloudflare bindings

# Building / Deploying
bun run build               # Generate Wrangler types and type-check
bun run deploy              # Deploy to Cloudflare (applies remote migrations first)

# Database
bun run db:generate          # Generate a new Drizzle migration
bun run db:migrations:list   # List pending production migrations
bun run db:migrate           # Apply committed migrations to production D1
bun run db:pull              # Pull the remote D1 schema
bun run db:studio            # Open Drizzle Studio against remote D1

# Types / Checks
bun run cf-typegen          # Regenerate Wrangler worker types
bun run check               # Run TypeScript type check
```

`wrangler dev` runs the API code locally, while `DB_RONCALPHOTO` and
`EMAIL_WORKER` connect to their production resources. Local CRUD and OTP tests
therefore read and write production data. No local D1, copied users, or seed
workflow exists.

## D1 migration workflow

D1 schema changes are versioned in `src/db/migrations`. Generation and
application are intentionally separate:

1. Change the Drizzle schemas in `src/db/schema`.
2. Run `bun run db:generate` once.
3. Review and commit the generated SQL and Drizzle metadata.
4. Inspect production with `bun run db:migrations:list`.
5. Run `bun run db:migrate`, or deploy with `bun run deploy`, which applies committed migrations
   before uploading the Worker.

`dev`, `db:migrate`, and `deploy` never generate migrations. A migration must
be reviewed and committed before it reaches production. The initial `0000`
migration is an idempotent baseline so existing production tables can be
registered without being recreated.

For destructive production schema changes, use expand/contract: first add
backward-compatible schema, then deploy code that supports it, and only remove
old columns or tables in a later migration after old code is no longer running.

## Relevant technical decisions

1. **Better Auth owns admin auth state**  
   `/api/auth/*` is mounted through Better Auth. D1 is the source of truth for the Better Auth `user`, `session`, `verification`, and `account` tables; the email-worker only delivers OTP messages. Legacy custom sessions do not migrate, so admins must sign in again after deployment.

2. **Sessions use a repository; photos and tags do not**  
   The sessions module has a full repository layer (`SessionsRepository`) because it manages cross-table transactions (session + session_tags). Photos and tags operate on single tables, so their services query Drizzle directly. This inconsistency is intentional: a repository is introduced only when multi-table transactions are needed.

3. **WeakMap singletons**  
   `getOrCreateInstance` caches DB, service, and repository instances per `D1Database` object. In the Worker runtime this avoids recreating Drizzle instances on every request without requiring global mutable state.

4. **Cross-site production cookies**  
   Production keeps the admin and API on different origins. Better Auth is configured with `SameSite=None`, `Secure`, and `Partitioned` cookies in production, while local development uses same-site cookies.

5. **OpenAPI route helpers preserve request inference**  
   The shared `createApiRoute` helper keeps each route's exact `request` and `responses` types intact so `c.req.valid("json")`, `c.req.valid("param")`, and `c.req.valid("query")` stay strongly typed inside handlers.
