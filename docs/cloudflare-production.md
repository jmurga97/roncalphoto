# Cloudflare production setup

This document is the operational source of truth for RoncalPhoto Cloudflare
deployments. It separates Wrangler build/deploy credentials from application
runtime variables so deploy tokens do not leak into Worker runtime
environments.

## Deploy targets

| App | Cloudflare project | Type | Project path |
|-----|--------------------|------|--------------|
| `apps/photos` | `roncalphoto-photos` | Worker (static assets SPA) | `apps/photos` |
| `apps/photos-admin` | `roncalphoto-admin` | Worker (static assets SPA) | `apps/photos-admin` |
| `apps/api` | `roncalphoto-api` | Worker | `apps/api` |
| `apps/email-worker` | `roncalphoto-email-worker` | Worker | `apps/email-worker` |
| `apps/image-optimizer` | `roncalphoto-image-optimizer` | Worker | `apps/image-optimizer` |

## Wrangler build/deploy credentials

Configure these as Cloudflare build/deploy environment variables for every
project above. They are consumed by Wrangler during deploy commands.

| Name | Cloudflare type | Scope | Purpose |
|------|-----------------|-------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | Plain text variable | Build/deploy only | Selects the Cloudflare account for Wrangler operations. |
| `CLOUDFLARE_API_TOKEN` | Secret | Build/deploy only | Authenticates Wrangler deploy, D1 migration, and Worker upload commands. |

Do not add either value to `wrangler.toml [vars]`, Worker runtime variables,
`.dev.vars`, or `.env.example`. `CLOUDFLARE_API_TOKEN` is a deployment
credential, not an application secret.

Cloudflare references:

- [Wrangler system environment variables](https://developers.cloudflare.com/workers/wrangler/system-environment-variables/)
- [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Workers static assets](https://developers.cloudflare.com/workers/static-assets/)
- [Single Page Application routing](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)

## Dashboard setup

### Frontend Worker projects

For `roncalphoto-admin` and `roncalphoto-photos`:

1. Open **Workers & Pages** and select the Worker project.
2. Go to **Settings > Build**.
3. Use a Build API token with Worker deploy permissions for the account.
4. If you deploy from external CI instead of Workers Builds, add `CLOUDFLARE_ACCOUNT_ID`
   and `CLOUDFLARE_API_TOKEN` as CI-only environment variables there.
5. Keep runtime settings free of Wrangler deploy credentials.

Recommended admin build configuration:

```bash
# Build command
cd ../../ && bun install && bunx turbo run build --filter=@roncal/photos-admin

# Deploy command
bunx wrangler deploy

# Version command
bunx wrangler versions upload

# Path
apps/photos-admin
```

Recommended public photos build configuration:

```bash
# Build command
cd ../../ && bun install && bunx turbo run build --filter=@roncal/photos-app

# Deploy command
bunx wrangler deploy

# Version command
bunx wrangler versions upload

# Path
apps/photos
```

### Worker projects

For `roncalphoto-api`, `roncalphoto-email-worker`, and
`roncalphoto-image-optimizer`:

1. Open **Workers & Pages** and select the Worker.
2. If Cloudflare Workers Builds deploy the Worker, prefer the project's Build
   API token. Only add `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` when
   an external CI system is running Wrangler directly.
3. Keep runtime variables and runtime secrets in **Settings > Variables and Secrets**.
4. Keep deploy credentials out of runtime settings.

Recommended production deploy command:

```bash
bun run deploy
```

Recommended non-production Worker upload command:

```bash
bunx wrangler versions upload
```

## Runtime variables and secrets

Runtime values are available to application code through Worker bindings or
build-time frontend variables. They must stay separate from Wrangler deploy
credentials.

### `roncalphoto-api`

| Name | Source | Notes |
|------|--------|-------|
| `DB_RONCALPHOTO` | `wrangler.toml` D1 binding | Portfolio database. |
| `EMAIL_WORKER` | `wrangler.toml` service binding | Preferred production OTP delivery path. |
| `ALLOWED_ORIGINS` | `wrangler.toml [vars]` | Additional CORS origins. |
| `LOG_LEVEL` | `wrangler.toml [vars]` | Production log level. |
| `NODE_ENV` | `wrangler.toml [vars]` | `production` in Cloudflare. |
| `BETTER_AUTH_URL` | `wrangler.toml [vars]` | Canonical API origin. |
| `PHOTOS_ADMIN_URL` | `wrangler.toml [vars]` | Canonical admin origin. |
| `BETTER_AUTH_SECRET` | Runtime secret | Required for Better Auth. |
| `EMAIL_WORKER_API_KEY` | Runtime secret | Required only for fallback HTTP OTP delivery. |
| `EMAIL_WORKER_URL` | Runtime variable | Local/fallback only; production should prefer `EMAIL_WORKER`. |

### `roncalphoto-email-worker`

| Name | Source | Notes |
|------|--------|-------|
| `SEND_EMAIL` | `wrangler.toml` send_email binding | Sends OTP emails. |
| `FROM_EMAIL` | `wrangler.toml [vars]` | Verified sender address. |
| `FROM_NAME` | `wrangler.toml [vars]` | Sender display name. |
| `WORKER_API_KEY` | Runtime secret | Shared with API fallback HTTP mode. |

### `roncalphoto-image-optimizer`

| Name | Source | Notes |
|------|--------|-------|
| `IMAGES` | `wrangler.toml` Images binding | Reads and transforms images. |
| `DB_RONCALPHOTO` | `wrangler.toml` D1 binding | Upload jobs and photos. |
| `ORIGINALS_BUCKET` | `wrangler.toml` R2 binding | Original uploads. |
| `MEDIA_BUCKET` | `wrangler.toml` R2 binding | Processed public media. |
| `IMAGE_PROCESSING_QUEUE` | `wrangler.toml` Queue binding | Async processing. |
| `ALLOWED_ORIGINS` | `wrangler.toml [vars]` | Admin CORS origins. |
| `NODE_ENV` | `wrangler.toml [vars]` | `production` in Cloudflare. |
| `PUBLIC_MEDIA_BASE_URL` | `wrangler.toml [vars]` | Public media URL. |
| `R2_ACCOUNT_ID` | `wrangler.toml [vars]` | R2 S3-compatible endpoint account ID. |
| `R2_ORIGINALS_BUCKET_NAME` | `wrangler.toml [vars]` | Bucket name used in presigned URLs. |
| `ADMIN_UPLOAD_TOKEN` | Runtime secret | Bearer token for upload endpoints. |
| `R2_ACCESS_KEY_ID` | Runtime secret | R2 S3-compatible signing key. |
| `R2_SECRET_ACCESS_KEY` | Runtime secret | R2 S3-compatible signing secret. |

### Frontend Workers

| Name | Source | Notes |
|------|--------|-------|
| `VITE_API_URL` | Build variable, optional | Overrides the API origin at frontend build time. |

If omitted, the frontend uses the repository default API origin outside local
development.

## Deploy order

1. `roncalphoto-email-worker`
2. `roncalphoto-api`
3. `roncalphoto-image-optimizer`
4. `roncalphoto-photos`
5. `roncalphoto-admin`

Deploy the email worker before the API so the `EMAIL_WORKER` service binding can
resolve. Deploy frontends last so they point at the latest backend behavior.

## Verification

Run local checks before pushing deploy changes:

```bash
bun run check
bun run build
```

Targeted app checks:

```bash
cd apps/api && bun run build
cd apps/email-worker && bun run build
cd apps/image-optimizer && bun run build
cd apps/photos-admin && bun run build
cd apps/photos && bun run build
```

After configuring dashboard variables, trigger `roncalphoto-admin` first because
it is the project that previously failed at `bunx wrangler deploy`. The deploy should
get past Wrangler authentication/account discovery. Repeat for the remaining
projects.
