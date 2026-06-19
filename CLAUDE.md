# CLAUDE.md — RoncalPhoto

## Project Overview

Monorepo for a professional photography portfolio. Deployed on Cloudflare.

```
roncalphoto/
├── apps/
│   ├── api/            # Hono REST API on Cloudflare Workers + D1
│   ├── photos/         # Public gallery — Vite + React 19
│   └── photos-admin/   # Admin dashboard — Vite + React 19 (auth-protected)
├── packages/
│   ├── auth/           # @roncal/auth — Better Auth server factory (OTP via email)
│   ├── shared/         # @roncal/shared — Domain types, mappers, normalizers (no build step)
│   └── ui/             # @roncal/ui — Shared React primitives (SuspenseWrapper)
```

External services consumed via Cloudflare service bindings:
- `ming-email-worker` — transactional emails (OTP delivery)
- `ming-image-worker` — image processing (resize, thumbnails, R2 storage)

## Commands

```bash
bun run dev             # Start all apps (turborepo, persistent)
bun run build           # Build all apps
bun run check           # Type-check all apps (depends on ^build)
bun run lint            # Prettier check + ESLint
bun run lint:fix        # Auto-fix formatting and lint errors

# API-specific (run from apps/api/)
bun run db:migrate      # Run D1 migrations (remote)
bun run db:generate     # Generate Drizzle migration from schema changes
bun run db:studio       # Open Drizzle Studio
bun run deploy          # Migrate + deploy to Cloudflare
```

Package manager: **Bun only**. Do not use npm, yarn, or pnpm.

## Stack

- **Monorepo**: Turborepo + Bun workspaces
- **Frontend**: Vite, React 19, TanStack Router (file-based routing), TanStack Query, Zustand
- **Styling**: Tailwind CSS 4 — prefer Tailwind classes over creating CSS files
- **Forms**: React Hook Form + Zod (admin only)
- **API**: Hono on Cloudflare Workers
- **Database**: D1 (SQLite) with Drizzle ORM
- **Auth**: Better Auth with Email OTP
- **Validation**: Zod 4
- **External UI**: `@murga.ing/components` (Lit web components, admin only)
- **Linting**: ESLint 9 (flat config) + Prettier

## Code Conventions

### TypeScript
- `strict: true` across the board (`noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `strictNullChecks`)
- Avoid `any` — use proper types or `unknown`
- Keep domain types non-nullable in `@roncal/shared`; normalize D1 nulls in the API layer
- Use consistent type imports (`import type`)

### Formatting
- Prettier: 100 print width, double quotes, trailing commas, 2-space indent
- Run `bun run lint:fix` before committing

### Accessibility
- Semantic HTML, ARIA where applicable, full keyboard navigation

## Architecture

### API Module Structure (`apps/api/src/`)

Layered architecture enforced by ESLint import boundaries:

```
routes → services → repositories → db/schema
```

- **Modules** (`src/modules/`): photos, sessions, tags, photo-uploads, deliveries, client-deliveries
- Modules must not import from each other
- `src/shared/` (errors, lib, utils) is available to all modules
- `src/app/` contains the Hono app factory and middleware
- `src/config/` for environment and OpenAPI setup

### Frontend Structure (`apps/photos/` and `apps/photos-admin/`)

```
src/
├── app/           # TanStack Router routes, layouts, store, providers
├── components/    # Reusable UI components
├── pages/         # Full page layouts
├── lib/           # API client, feature-specific logic
└── utils/         # Utilities
```

ESLint enforces layered imports: `utils → lib → components → pages`

Path aliases: `@`, `@app`, `@components`, `@lib`, `@utils`

### Shared Packages
- `@roncal/shared` — pure TypeScript, no build step. Import directly from source.
- `@roncal/auth` — exports server factory (default) and client config (`./client`)
- `@roncal/ui` — React primitives with peer deps on React 19 + TanStack Query

## Domain Model

Central entity: **Session** (a photography session/gallery), identified by `slug`.

- Session has 1..n **Tags**
- Session has 1..n **Photos** (with metadata: camera, lens, aperture, shutter speed, ISO)
- Public route: `/session/:slug`

Canonical types in `packages/shared/src/types.ts`: `Photo`, `PhotoMetadata`, `PhotoSummary`, `Tag`, `Session`, `SessionSummary`, `ApiPhoto`, `ApiSession`, `ApiTagWithSessions`, `ApiResponse<T>`, `PaginatedResponse<T>`

## API Routes

- `GET /api/sessions` (`?include=photos` for full hydration)
- `GET /api/sessions/:slug`
- `GET /api/tags`
- `GET /api/tags/:slug`
- `GET /api/photos`
- `GET /api/photos/:id`
- `POST /api/photo-uploads` (admin, starts async upload)
- `GET /api/photo-uploads/:uploadId` (poll upload status)
- `/api/auth/*` (Better Auth endpoints)

### Image Upload Flow
1. Admin POSTs to `/api/photo-uploads` → API reserves photo ID, calls `ming-image-worker`
2. Browser gets signed PUT URL, uploads original to R2 directly
3. R2 fires `object-create` → Queue → `ming-image-worker` generates main + thumbnail
4. Admin polls upload status until complete

## Infrastructure

- **Runtime**: Cloudflare Workers (all apps)
- **Database**: D1 SQLite (binding `DB_RONCALPHOTO`, remote in prod)
- **Storage**: R2 for images
- **Service bindings**: `EMAIL_WORKER` → ming-email-worker, `IMAGE_WORKER` → ming-image-worker
- **Migrations**: Drizzle ORM (`apps/api/src/db/migrations/`), driver `d1-http`

## Local Development

Default ports:
- API: `8787`
- Admin: `5173`
- Photos: `5174`

Required `apps/api/.dev.vars`:
```
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=...
PHOTOS_ADMIN_URL=...
```

Uses real Cloudflare resources via `wrangler dev` (remote D1, R2).

## Quality Rules

- Do not merge with type errors or lint failures
- Measure before optimizing performance
- Avoid overengineering — prefer splitting by files/classes following singleton patterns where it makes sense
- ESLint limits: max depth 4, max function lines 80 (React components: 260)
- No console usage except `console.error` and `console.log`

## UI/UX Guidelines

- Layout fixed to `100vh`
- Sidebar on desktop, overlay on mobile
- Gallery: main photo + thumbnails
- Keyboard navigation: arrows + Escape
- Smooth CSS transitions and animations
