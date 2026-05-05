# @roncal/email-worker

Transactional email worker for the RoncalPhoto monorepo. Built as a Cloudflare Worker using Hono.

## Package purpose

This worker sends OTP emails for the admin dashboard authentication flow. It exposes a single protected endpoint that accepts a destination address, an OTP code, and an expiration label, then delivers a rendered email through Cloudflare's `send_email` binding.

## Internal dependencies

| Package | Why it is used |
|---------|----------------|
| `@roncal/email-templates` | Renders the OTP email into HTML and plain text using React Email. Keeps template markup out of the worker. |

## Folder structure

```
src/
└── index.ts          # Worker entry point: types, validation, middleware, route handlers, and app bootstrap
wrangler.toml         # Worker configuration (send_email binding, vars, observability)
tsconfig.json         # TypeScript config (extends root, jsx required for @roncal/email-templates imports)
package.json          # Workspace metadata and scripts
.dev.vars.example     # Local environment variable template
```

## Architecture

The worker is intentionally kept as a **single-file Hono application**. There is no router/service/repository split because the domain surface is tiny (one route, one operation).

### Layers

| Layer | Responsibility |
|-------|----------------|
| **Types** | Local interfaces for Cloudflare bindings (`SEND_EMAIL`), request payloads, and email shapes. |
| **Validation** | Pure functions (`isObject`, `isNonEmptyString`, `isEmail`, `parseOtpRequestBody`) that guard the request body without external schema libraries. |
| **Middleware** | `app.use("/send/*")` validates the `X-Api-Key` header against `WORKER_API_KEY` when the key is configured. |
| **Route handler** | `POST /send/otp` renders the email template and calls the Cloudflare email binding. |

### Patterns

- **Manual validation** instead of Zod. Given the single endpoint and tiny payload, plain type guards are sufficient and avoid an extra dependency.
- **Response envelope**: every JSON response follows `{ success: true, data: ... }` or `{ success: false, error: { code, message } }`.
- **Standard `Error` handling**: email binding failures are coerced to standard `Error` instances so consumers receive a human-readable message without relying on non-standard error codes.

## Request lifecycle

1. **Cloudflare Worker** receives the request and invokes `src/index.ts`.
2. **Hono router** matches the path.
3. **Auth middleware** (`/send/*`) checks `X-Api-Key` against `WORKER_API_KEY` if the latter is configured. If the key is missing or mismatched, the request is rejected with `401`.
4. **`POST /send/otp`**:
   - Parses the JSON body.
   - Validates the shape `{ to, otp, expiresIn }` using `parseOtpRequestBody`.
   - Calls `renderOtpEmail` from `@roncal/email-templates` to produce HTML and text bodies.
   - Sends the message via `c.env.SEND_EMAIL.send`.
   - Returns `{ success: true, data: { messageId } }` on success.
   - Returns `{ success: false, error: { code: "EMAIL_SEND_FAILED", message } }` on failure.
5. **Any other route** → `404` with `{ success: false, error: { code: "NOT_FOUND", message } }`.

## Configuration

### Required environment variables / bindings

| Name | Type | Purpose |
|------|------|---------|
| `SEND_EMAIL` | `send_email` binding | Cloudflare transactional email binding used to deliver messages. |
| `FROM_EMAIL` | string (via `wrangler.toml` `[vars]`) | Verified sender address. |
| `FROM_NAME` | string (via `wrangler.toml` `[vars]`) | Display name for the sender. |
| `WORKER_API_KEY` | string (optional, via `.dev.vars`) | Shared secret required in the `X-Api-Key` header. If omitted, auth middleware is bypassed. |

> **Local development**: copy `.dev.vars.example` to `.dev.vars` and set `WORKER_API_KEY` to the same value configured in `apps/api` (`EMAIL_WORKER_API_KEY`).

### Cloudflare deploy credentials

`CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` must be configured as
Cloudflare build/deploy environment variables for the
`roncalphoto-email-worker` Worker project when Cloudflare builds deploy this
app. They are consumed by Wrangler during `bun run deploy`; they must not be
added to `wrangler.toml [vars]`, `.dev.vars`, or runtime secrets.

## Available scripts

```bash
# Development
bun run dev                 # Start Wrangler dev server on :8788

# Building / Deploying
bun run build               # Dry-run Wrangler deploy to ./dist
bun run deploy              # Deploy to Cloudflare

# Types / Checks
bun run check               # Run TypeScript type check
```

## Relevant technical decisions

1. **Single-file architecture**  
   The entire application lives in `src/index.ts`. No folders for routes, services, or utilities are needed because the worker only exposes one endpoint. This keeps the cognitive load minimal and avoids premature abstraction.

2. **Plain type guards instead of Zod**  
   The rest of the monorepo uses Zod for validation, but this package avoids it because the input shape is tiny and static. Adding Zod would increase bundle size and complexity for marginal gain.

3. **Standard `Error` over custom error codes**  
   The Cloudflare `send_email` binding may throw arbitrary errors. The worker normalizes them to standard `Error` instances and surfaces the message to the caller. A fixed `EMAIL_SEND_FAILED` code is used in the response envelope so API consumers can still distinguish email failures from other errors.

4. **404 envelope aligned with error routes**  
   All error responses (including 404) use the `{ success: false, error: { code, message } }` shape. This is consistent with the rest of the API and removes the need for consumers to check multiple possible keys.

5. **`jsx` required in `tsconfig.json`**  
   The worker itself contains no JSX, but it imports `@roncal/email-templates`, which exports `.tsx` files. TypeScript needs `jsx: "react-jsx"` to resolve those imports correctly during type checking.
