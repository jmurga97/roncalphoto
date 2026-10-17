# CLAUDE.md — RoncalPhoto

Read `README.md` for the full architecture, data model, API reference and flows. This file holds the
rules to follow while working in the repo.

## Project Overview

Monorepo for a professional photography portfolio, deployed on Cloudflare Workers. Structure
mirrors QMenut: native-fetch Worker + tRPC, Drizzle over D1, types inferred end to end.

```
roncalphoto/
├── apps/
│   ├── api/            # tRPC + Better Auth Worker over D1 (exports AppRouter as @roncal/api/router)
│   ├── photos/         # Public gallery — Vite + React 19
│   └── photos-admin/   # Admin dashboard — Vite + React 19 (auth-protected)
├── packages/
│   ├── db/             # @roncal/db — Drizzle schema, repositories, row→domain mappers
│   ├── auth/           # @roncal/auth — Better Auth factory (email OTP) + React client
│   └── ui/             # @roncal/ui — createQueryClient, SuspenseWrapper
└── e2e/                # Playwright (admin) with mocked tRPC
```

External services via service bindings: `ming-email-worker` (`EMAIL_WORKER`, OTP emails) and
`ming-image-worker` (`IMAGE_WORKER`, RPC entrypoint `ImageRpc`: signed R2 uploads + variants).

## Commands

```bash
bun run dev             # All apps (api :8787, admin :5173, photos :5174) — API on PRODUCTION D1
bun run dev:local       # Same, API on a local D1 (wrangler dev --env local)
bun run db:seed:local   # Local migrations + apps/api/seed/seed-local.sql (re-runnable)
bun run build           # Build all apps
bun run check           # Type-check all workspaces + Drizzle schema/migrations check
bun run lint            # Oxfmt check + Oxlint (warnings fail)
bun run lint:fix        # Auto-fix formatting and lint errors
bun run test:e2e        # Playwright admin suite (mocked API)
bun run db:generate -- --name <change>   # Migration from schema changes
bun run db:check        # Schema matches committed migrations

# apps/api
bun run db:migrate      # Apply D1 migrations (remote)
bun run deploy          # Migrate + deploy
```

Package manager: **Bun only**. Do not use npm, yarn, or pnpm.

## Stack

- **Monorepo**: Turborepo + Bun workspaces
- **Frontend**: Vite, React 19, TanStack Router (file-based), TanStack Query, Zustand
- **Styling**: Tailwind CSS 4 — prefer Tailwind classes over creating CSS files
- **Forms**: React Hook Form + Zod (admin only)
- **API**: tRPC (`@trpc/server` fetch adapter) on Cloudflare Workers
- **Client data**: `@trpc/tanstack-react-query` options proxy (`trpc.x.queryOptions()`)
- **Database**: D1 (SQLite) with Drizzle ORM (relational queries + `db.batch()`)
- **Auth**: Better Auth with Email OTP (sign-up disabled)
- **Validation**: Zod 4
- **Admin UI kit**: `@jmurga97/components` (Ming design system, React) from GitHub Packages
- **Linting**: Oxlint (type-aware) + Oxfmt, following QMenut

## Code Conventions

### TypeScript

- `strict: true` (`noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `strictNullChecks`)
- Avoid `any` — use proper types or `unknown`
- Domain types are non-nullable; D1 nulls are normalised in `packages/db/src/mappers.ts`
- Use consistent type imports (`import type`)
- Never hand-write a type that the router can infer: derive it from `RouterOutputs`/`RouterInputs`
  exported by `@roncal/api/router`

### Formatting

- Oxfmt: 120 print width, double quotes, trailing commas, 2-space indent
- Oxfmt keeps import, package.json and Tailwind sorting disabled (same policy as QMenut)
- Run `bun run lint:fix` before committing

### Accessibility

- Semantic HTML, ARIA where applicable, full keyboard navigation

## Architecture

### API (`apps/api/src/`)

```
tRPC routers → services → @roncal/db repositories → D1
```

- `index.ts` dispatches `/health`, `/api/auth/*`, `/trpc/*` and applies CORS
- `config/env.ts` validates bindings/vars; `http/cors.ts`; `auth.ts`
- `trpc/` owns context (`db`, lazy memoised `getSession`), `publicProcedure`/`protectedProcedure`
  and the root router
- `modules/<domain>/`: `<domain>.router.ts`, `<domain>.service.ts`, `<domain>-input.schema.ts`
  (domains: sessions, photos, tags, photo-uploads, client-deliveries)
- Services and repositories are plain functions with `db` as first argument (the ES module is the
  singleton); import repositories as namespaces (`import * as sessionsRepository from …`)
- `shared/` holds `errors.ts` (`toRpcError`, `orNotFound`) and `input.schema.ts` (inputs used by
  several modules)
- Oxlint-enforced: modules never import each other; routers never import `@roncal/db`/`drizzle-orm`;
  modules never import `drizzle-orm` or `@roncal/db/schema`; `config/` and `shared/` never import
  modules or `trpc/`; `packages/db` never imports apps or `@roncal/api/router`
- Prefer database constraints (FK, unique) over pre-check queries; `toRpcError` maps them to
  `BAD_REQUEST`/`CONFLICT`

### Frontend (`apps/photos/` and `apps/photos-admin/`)

```
src/
├── app/           # Routes, layouts, store, providers
├── components/    # Reusable UI components
├── pages/         # Full page layouts
├── lib/           # API client (lib/api/client.ts), feature logic
└── utils/         # Utilities
```

- Oxlint enforces layered imports: `utils → lib → components → pages`
- Path aliases: `@`, `@app`, `@components`, `@lib`, `@pages` (admin), `@utils`
- Data: route `loader` → `ensureQueryData(trpc.x.queryOptions(input))`; components →
  `useSuspenseQuery(trpc.x.queryOptions(input))`; admin writes →
  `useMutation(trpc.x.mutationOptions())` then `invalidatePortfolio()`

## Domain Model

Central entity: **Session** (a photography session/gallery), identified by `slug`.

- Session has 1..n **Tags** and 0..n **Photos** (metadata: camera, lens, aperture, shutter speed, ISO)
- Photos are created through `photoUploads` (image worker), then edited with `photos.update`
- Client deliveries are read by secret token (`clientDeliveries.get`)
- Public route: `/session/:slug`
- Client types (`@roncal/api/router`): `RouterInputs`, `RouterOutputs`, `Session`, `Photo`,
  `PhotoMetadata`, `Tag`

## Database

- Schema: `packages/db/src/schema/` (camelCase TS keys, snake_case SQL); `schema/index.ts` is the
  only Drizzle Kit entry
- Migrations: Drizzle Kit generates SQL + snapshots in `apps/api/migrations/`; Wrangler applies them.
  Never hand-write normal DDL, use push, or edit applied migrations
- Use `db.batch()` for atomic D1 writes

## Local Development

Required `apps/api/.dev.vars` (see `.dev.vars.example`):

```
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:8787
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
NODE_ENV=development
```

`bun run dev` uses **remote** Cloudflare resources (production D1, R2, workers). Prefer
`bun run db:seed:local && bun run dev:local` for local work: `[env.local]` in `wrangler.toml` binds a
Miniflare D1 (placeholder `database_id = "local"`) and non-running email/image workers (uploads
fail). Admin login there: `juanmurga97@gmail.com` + OTP `000000`. `DEV_FIXED_OTP` lives only in
`[env.local.vars]` and is ignored when `NODE_ENV=production`; never add it to `.dev.vars` or the
production `[vars]`. New seed data goes in `apps/api/seed/seed-local.sql` (delete-by-id first so it
stays re-runnable).

Frontends read `VITE_API_URL` from the repo-root `.env` (optional). `bun install` needs `NPM_TOKEN`
for `@jmurga97/components`.

## Quality Rules

- Do not add tests for this refactor; validate types, lint, build and manual flows (the existing
  Playwright suite must keep passing)
- Do not merge with type errors or lint failures
- Measure before optimizing performance
- Avoid overengineering — no interfaces with one implementation, no wrappers around tRPC
- Oxlint limits: max depth 4, max 6 parameters, max function lines 80 (React components: 260)
- No console usage except `console.error` and `console.log`

## UI/UX Guidelines

- Layout fixed to `100vh`
- Sidebar on desktop, overlay on mobile
- Gallery: main photo + thumbnails
- Keyboard navigation: arrows + Escape
- Smooth CSS transitions and animations
