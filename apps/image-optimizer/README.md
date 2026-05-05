# RoncalPhoto Image Optimizer

## Package purpose

Internal Cloudflare Worker that powers the image upload pipeline for the
photographer's portfolio dashboard. It is **not** a public generic image
compression API.

The service orchestrates three things:

1. **Upload negotiation** — receives metadata from the dashboard, creates tracking
   jobs in D1 and returns presigned R2 URLs so the browser can upload originals
   directly.
2. **Completion & enqueueing** — once the browser confirms the upload, the worker
   verifies the object exists in R2, marks the job as `queued` and pushes a
   message to a Cloudflare Queue.
3. **Async processing** — the Queue consumer reads the original, transforms it
   with the Cloudflare Images binding into two WebP outputs (main and thumbnail)
   and persists them in the media bucket, then upserts the final `photos` row
   in D1.

## Internal dependencies

`apps/image-optimizer` is a **leaf app** inside the monorepo. It does **not**
import any `@roncal/*` package (`shared`, `auth`, `ui`, etc.).

Its only coupling with the rest of the system is the **shared D1 database**
(`DB_RONCALPHOTO`) that lives in `apps/api`. It reads from `sessions` and
writes to `photo_upload_jobs` and `photos` using the same schema that the API
manages.

External runtime dependencies:

- `hono` — HTTP framework.
- `zod` — environment and request validation.
- `aws4fetch` — S3-compatible presigned URL signing for R2.

## Folder structure

```text
src/
  index.ts              # Worker entry point: exports fetch (Hono) and queue handlers
  app/
    create-app.ts       # Hono app factory: middleware, health check, route registration
    routes.ts           # Mounts module routers under /api/images
    middlewares/
      cors.ts           # Origin validation for dashboard requests
  config/
    env.ts              # Environment parsing, validation and runtime context helper
    types.ts            # App bindings, Hono types and manual Cloudflare platform stubs
    status-codes.ts     # Named HTTP status code constants
    handlers.ts         # Global 404 and error handlers (HttpError + ZodError mapping)
  modules/
    uploads/            # Upload domain
      routes.ts         # Route definitions: POST /uploads, /uploads/complete, /uploads/:id/retry, GET /uploads
      service.ts        # Business logic: job lifecycle, queue integration, image processing orchestration
      repository.ts     # D1 persistence: jobs CRUD, photo upsert, session existence check
      queue.ts          # Queue consumer entry point
      schemas.ts        # Zod request validation schemas
      types.ts          # Domain types: job statuses, inputs, outputs, progress
      auth.ts           # Bearer token extraction and verification
      signing.ts        # Presigned R2 PUT URL generation via aws4fetch
      keys.ts           # Object key naming and public URL construction utilities
    images/             # Image optimization abstraction
      engine.ts         # Wrapper around the Cloudflare Images binding
      profiles.ts       # Output profiles: main (1920px) and thumbnail (480px)
      types.ts          # MIME type constants and image profile interfaces
  shared/
    errors/
      http-error.ts     # Typed HTTP error class used across the app
    lib/
      http.ts           # `jsonSuccess` helper for consistent response shape
```

## Architecture

The app follows a **layered architecture** with clear separation of concerns:

| Layer | Responsibility |
|-------|----------------|
| **Config** | Environment schema (Zod), manual platform type stubs, status codes, global handlers. |
| **App** | Hono instance, CORS middleware, route mounting, health endpoint. |
| **Routes** | HTTP surface: auth, input validation, service invocation, response formatting. |
| **Service** | Business rules: job state machine, R2/Queue coordination, image processing flow. |
| **Repository** | D1 access abstracted behind the `UploadJobsStore` interface. |
| **Shared** | Tiny cross-cutting helpers (`HttpError`, `jsonSuccess`). |

**Patterns in use:**

- **Factory-based dependency injection** — `createUploadsService(env)` wires the
  service with its repository and platform bindings (R2, Queue, Images).
- **Repository pattern** — `UploadJobsRepository` implements `UploadJobsStore`,
  making the service testable without a real D1 database.
- **Queue-driven async processing** — The HTTP path only enqueues; a separate
  `queue` handler processes images asynchronously, keeping upload confirmation
  latency low.

## Request lifecycle

### HTTP request

```
Browser/Dashboard
  → Cloudflare Worker (fetch handler)
    → Hono app
      → Middleware: parse env + CORS validation
      → Route handler
        → Auth: Bearer token verification
        → Validation: Zod schema parsing
        → Service: business logic execution
          → Repository: D1 queries
          → R2/Queue: storage or enqueueing
        → jsonSuccess(response)
      → (on error) Global error handler
```

### Queue message

```
Cloudflare Queue
  → Worker (queue handler)
    → processUploadQueueBatch(batch, env)
      → parseEnv + createUploadsService
      → for each message:
        → service.processMessage(message)
          → load job from D1
          → update status → processing
          → read original from R2 ORIGINALS_BUCKET
          → engine.readInfo (validate format)
          → engine.transform → main.webp → MEDIA_BUCKET
          → engine.transform → thumb.webp → MEDIA_BUCKET
          → repository.upsertPhoto (D1)
          → update status → done
          → (on error) update status → error + message
```

## Configuration

Bindings declared in `wrangler.toml`:

| Binding | Type | Purpose |
|---------|------|---------|
| `IMAGES` | Cloudflare Images | Image info and transformation engine. |
| `DB_RONCALPHOTO` | D1 | Shared portfolio database (jobs + photos tables). |
| `ORIGINALS_BUCKET` | R2 | Private bucket where browsers upload unprocessed originals. |
| `MEDIA_BUCKET` | R2 | Public bucket that serves processed main and thumbnail images. |
| `IMAGE_PROCESSING_QUEUE` | Queue | Async pipeline for image transformation jobs. |

Environment variables / secrets:

| Variable | Source | Purpose |
|----------|--------|---------|
| `ADMIN_UPLOAD_TOKEN` | Secret | Bearer token required by all upload endpoints. |
| `PUBLIC_MEDIA_BASE_URL` | `wrangler.toml` | Public base URL used to construct final `photos.url` and `photos.miniature`. |
| `R2_ACCESS_KEY_ID` | Secret | S3-compatible credentials for signing presigned R2 URLs. |
| `R2_SECRET_ACCESS_KEY` | Secret | S3-compatible secret for signing presigned R2 URLs. |
| `R2_ACCOUNT_ID` | `wrangler.toml` | Cloudflare account ID for R2 S3-compatible endpoint. |
| `R2_ORIGINALS_BUCKET_NAME` | `wrangler.toml` | Real bucket name used in the presigned URL path. |
| `ALLOWED_ORIGINS` | `wrangler.toml` (optional) | Comma-separated list of additional CORS origins. |
| `NODE_ENV` | `wrangler.toml` | `development` \| `test` \| `production`; controls CORS strictness. |

Local secrets live in `.dev.vars` (see `.dev.vars.example`).

## Available scripts

```bash
# Local development server with hot reload
bun run dev

# Type check without emitting
bun run check

# Build / dry-run deploy
bun run build

# Deploy to Cloudflare
bun run deploy

# Regenerate Wrangler types from bindings
bun run cf-typegen
```

## Relevant technical decisions

1. **Manual Cloudflare platform stubs** (`src/config/types.ts`)
   The app defines its own minimal interfaces for `R2BucketBinding`,
   `D1DatabaseBinding`, `ImagesBinding`, etc. instead of importing
   `@cloudflare/workers-types`. This is intentional because the generic
   `workers-types` package does not include the `ImagesBinding` shape, and
   keeping lightweight stubs avoids version mismatches across the monorepo.

2. **Three R2 GETs per job**
   `processJob` fetches the same original from R2 three times: once for
   `info`, once for the main transform and once for the thumbnail transform.
   This is required because `ReadableStream` can only be consumed once and
   Cloudflare Images processes the stream directly.

3. **No internal package imports**
   `image-optimizer` deliberately does not depend on `@roncal/shared` or any
   other workspace package. Its types are self-contained to keep the worker
   deploy boundary small and avoid leaking frontend or API abstractions into
   the image pipeline.

4. **Job table as state machine**
   `photo_upload_jobs` tracks the full lifecycle (`awaiting_upload` → `queued`
   → `processing` → `done`/`error`). The `photos` table only stores final
   output metadata. Retries are explicit via `POST /uploads/:uploadId/retry`
   and only allowed when the original is still present in `ORIGINALS_BUCKET`.

5. **Presigned uploads via `aws4fetch`**
   The dashboard receives S3-compatible presigned PUT URLs so the browser
   uploads directly to R2, bypassing the Worker for large binary payloads.
   This keeps the Worker lightweight and avoids request body size limits.
