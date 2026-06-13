# Cloudflare production setup

This document is the operational source of truth for RoncalPhoto Cloudflare
deployments. It separates Wrangler build/deploy credentials from application
runtime variables so deploy tokens do not leak into Worker runtime
environments.

## Deploy targets

| App                    | Cloudflare project            | Type                       | Project path           |
| ---------------------- | ----------------------------- | -------------------------- | ---------------------- |
| `apps/photos`          | `roncalphoto-photos`          | Worker (static assets SPA) | `apps/photos`          |
| `apps/photos-admin`    | `roncalphoto-admin`           | Worker (static assets SPA) | `apps/photos-admin`    |
| `apps/api`             | `roncalphoto-api`             | Worker                     | `apps/api`             |
| `apps/image-optimizer` | `roncalphoto-image-optimizer` | Worker                     | `apps/image-optimizer` |

Transactional email is deployed separately from the `ming-email-worker` repository. RoncalPhoto
depends on that Worker through the `EMAIL_WORKER` service binding.

Image upload and optimization is deployed separately from the `ming-image-worker` repository.
RoncalPhoto depends on it through `IMAGE_WORKER`. `apps/image-optimizer` remains a legacy drain-only
deployment until its existing jobs and `photo_upload_jobs` table can be removed.

## Wrangler build/deploy credentials

Configure these as Cloudflare build/deploy environment variables for every
project above. They are consumed by Wrangler during deploy commands.

| Name                    | Cloudflare type     | Scope             | Purpose                                                                  |
| ----------------------- | ------------------- | ----------------- | ------------------------------------------------------------------------ |
| `CLOUDFLARE_ACCOUNT_ID` | Plain text variable | Build/deploy only | Selects the Cloudflare account for Wrangler operations.                  |
| `CLOUDFLARE_API_TOKEN`  | Secret              | Build/deploy only | Authenticates Wrangler deploy, D1 migration, and Worker upload commands. |

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

For `roncalphoto-api` and `roncalphoto-image-optimizer`:

1. Open **Workers & Pages** and select the Worker.
2. Their committed `wrangler.toml` files pin the non-secret Cloudflare account
   ID so local remote bindings do not depend on membership discovery.
3. If Cloudflare Workers Builds deploy the Worker, prefer the project's Build
   API token. Only add `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` when
   an external CI system is running Wrangler directly.
4. Keep runtime variables and runtime secrets in **Settings > Variables and Secrets**.
5. Keep deploy credentials out of runtime settings.

Recommended production deploy command:

```bash
bun run deploy
```

For `roncalphoto-api`, this command first runs
`wrangler d1 migrations apply DB_RONCALPHOTO --remote` and only deploys the
Worker if all committed migrations succeed. It never runs Drizzle generation.
Schema migrations must be generated and reviewed during development:

```bash
cd apps/api
bun run db:generate
bun run db:migrations:list
bun run db:migrate
```

Commit the generated SQL and metadata before deploying. For destructive changes
use an expand/contract rollout: deploy a backward-compatible schema first,
deploy code that can use both shapes, and remove the old schema in a later
migration.

Recommended non-production Worker upload command:

```bash
bunx wrangler versions upload
```

## Runtime variables and secrets

Runtime values are available to application code through Worker bindings or
build-time frontend variables. They must stay separate from Wrangler deploy
credentials.

### `roncalphoto-api`

| Name                 | Source                          | Notes                                     |
| -------------------- | ------------------------------- | ----------------------------------------- |
| `DB_RONCALPHOTO`     | `wrangler.toml` D1 binding      | Portfolio database.                       |
| `EMAIL_WORKER`       | `wrangler.toml` service binding | Preferred production OTP delivery path.   |
| `IMAGE_WORKER`       | `wrangler.toml` service binding | Private image upload and processing path. |
| `ALLOWED_ORIGINS`    | `wrangler.toml [vars]`          | Additional CORS origins.                  |
| `LOG_LEVEL`          | `wrangler.toml [vars]`          | Production log level.                     |
| `NODE_ENV`           | `wrangler.toml [vars]`          | `production` in Cloudflare.               |
| `BETTER_AUTH_URL`    | `wrangler.toml [vars]`          | Canonical API origin.                     |
| `PHOTOS_ADMIN_URL`   | `wrangler.toml [vars]`          | Canonical admin origin.                   |
| `BETTER_AUTH_SECRET` | Runtime secret                  | Required for Better Auth.                 |

### `ming-email-worker`

The standalone worker owns React Email templates, sender profiles, subjects, and product policy.
Its RoncalPhoto configuration must allow product `roncalphoto`, template `otp`, and sender profile
`roncalphoto-default`. The `SEND_EMAIL` binding must allow the verified sender
`noreply@mail.murga.ing`; no browser route, CORS configuration, or browser authentication is
required.

RoncalPhoto calls the worker through `EMAIL_WORKER` using
`POST https://email-worker.internal/send?productId=roncalphoto` with this contract:

```json
{
  "template": "otp",
  "fromProfile": "roncalphoto-default",
  "to": "<recipient>",
  "data": {
    "otp": "<otp>",
    "expiresIn": "<expiration>"
  },
  "metadata": {
    "source": "auth"
  }
}
```

### `ming-image-worker`

The standalone worker owns its own D1 upload state, Cloudflare Images transforms, Queue/DLQ, and
the configured RoncalPhoto R2 bindings. It must be deployed with product `roncalphoto`, preset
`roncalphoto-portfolio`, and storage profile `roncalphoto`.

Provision and verify:

- dedicated staging and production D1 databases;
- processing Queue plus dead-letter Queue;
- originals and media R2 bindings;
- `object-create` notification from the originals bucket to the processing Queue;
- bucket-scoped `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` secrets;
- R2 CORS allowing PUT from the admin origin;
- `workers_dev = false` and no public Worker route.

RoncalPhoto calls only `/v1/uploads`, `/v1/uploads/:uploadId`, and
`/v1/uploads/:uploadId/retry` through the service binding. The browser receives only the signed R2
PUT URL.

### Legacy `roncalphoto-image-optimizer`

| Name                       | Source                         | Notes                                 |
| -------------------------- | ------------------------------ | ------------------------------------- |
| `IMAGES`                   | `wrangler.toml` Images binding | Reads and transforms images.          |
| `DB_RONCALPHOTO`           | `wrangler.toml` D1 binding     | Upload jobs and photos.               |
| `ORIGINALS_BUCKET`         | `wrangler.toml` R2 binding     | Original uploads.                     |
| `MEDIA_BUCKET`             | `wrangler.toml` R2 binding     | Processed public media.               |
| `IMAGE_PROCESSING_QUEUE`   | `wrangler.toml` Queue binding  | Async processing.                     |
| `ALLOWED_ORIGINS`          | `wrangler.toml [vars]`         | Admin CORS origins.                   |
| `NODE_ENV`                 | `wrangler.toml [vars]`         | `production` in Cloudflare.           |
| `PUBLIC_MEDIA_BASE_URL`    | `wrangler.toml [vars]`         | Public media URL.                     |
| `R2_ACCOUNT_ID`            | `wrangler.toml [vars]`         | R2 S3-compatible endpoint account ID. |
| `R2_ORIGINALS_BUCKET_NAME` | `wrangler.toml [vars]`         | Bucket name used in presigned URLs.   |
| `ADMIN_UPLOAD_TOKEN`       | Runtime secret                 | Bearer token for upload endpoints.    |
| `R2_ACCESS_KEY_ID`         | Runtime secret                 | R2 S3-compatible signing key.         |
| `R2_SECRET_ACCESS_KEY`     | Runtime secret                 | R2 S3-compatible signing secret.      |

Do not send new dashboard uploads to this Worker. Keep it deployed only until existing jobs have
finished, then remove the Worker bindings and the legacy `photo_upload_jobs` table in a later
expand/contract migration.

### Frontend Workers

| Name           | Source                   | Notes                                            |
| -------------- | ------------------------ | ------------------------------------------------ |
| `VITE_API_URL` | Build variable, optional | Overrides the API origin at frontend build time. |

If omitted, the frontend uses the repository default API origin outside local
development.

## Deploy order

1. `ming-email-worker` (standalone repository)
2. `ming-image-worker` (standalone repository, including D1 migrations and Queue notifications)
3. `roncalphoto-api` (including migration `pending_photo_uploads`)
4. `roncalphoto-image-optimizer` only while legacy jobs remain
5. `roncalphoto-photos`
6. `roncalphoto-admin`

Deploy both standalone workers before the API so `EMAIL_WORKER` and `IMAGE_WORKER` resolve. Deploy
frontends last so the admin starts using uploads only after the API facade and D1 migration exist.

## Verification

Run local checks before pushing deploy changes:

```bash
bun run check
bun run build
```

Inspect pending production migrations without applying them:

```bash
cd apps/api
bun run db:migrations:list
```

Targeted app checks:

```bash
cd apps/api && bun run build
cd apps/image-optimizer && bun run build
cd apps/photos-admin && bun run build
cd apps/photos && bun run build
```

After configuring dashboard variables, trigger `roncalphoto-admin` first because
it is the project that previously failed at `bunx wrangler deploy`. The deploy should
get past Wrangler authentication/account discovery. Repeat for the remaining
projects.
