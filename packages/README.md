# RoncalPhoto — Shared Packages

This directory contains code that is reused across two or more apps in the monorepo. The rule of thumb is: if a module is imported by more than one app, or if it defines canonical domain types that must stay in sync between the API and the frontends, it belongs here.

Packages are consumed as TypeScript source (no dedicated build step) unless they require their own test runner or special compilation. This keeps the workspace fast and avoids stale declaration files.

---

## Package Index

| Package | Purpose | Consumed by |
|---------|---------|-------------|
| `@roncal/auth` | OTP generation, session-token hashing, KV-store primitives, and a `better-auth` factory. Also exposes a React client entry point (`@roncal/auth/client`). | `apps/api` |
| `@roncal/email-templates` | React Email templates (OTP email) rendered to HTML and plain text. | `apps/email-worker` |
| `@murga/components` | Lit-based custom elements library with React wrappers for the admin dashboard. | `apps/photos-admin` |
| `@roncal/shared` | Canonical domain types (`Photo`, `Session`, `Tag`, …), API mappers (`apiPhotoToPhoto`), normalizers, and runtime helpers (`resolveApiBaseUrl`). | `apps/api`, `apps/photos`, `apps/photos-admin`, `@roncal/auth` |
| `@roncal/ui` | Shared React primitives. Currently exports `SuspenseWrapper` (error-boundary + suspense). | `apps/photos` |

---

## Dependency Graph

```mermaid
graph TD
  apps/api --> @roncal/auth
  apps/api --> @roncal/shared
  apps/email-worker --> @roncal/email-templates
  apps/photos --> @roncal/shared
  apps/photos --> @roncal/ui
  apps/photos-admin --> @murga/components
  apps/photos-admin --> @roncal/auth
  apps/photos-admin --> @roncal/shared
  apps/photos-admin --> @roncal/ui
  @roncal/auth --> @roncal/shared
```

### Notes

- `@roncal/shared` is the single source of truth for the domain model. The API transforms D1 rows into these types, and the frontends consume them directly.
- `@roncal/auth` depends on `@roncal/shared` so that its client entry point can reuse `resolveApiBaseUrl` instead of hard-coding the auth base URL.
- `@murga/components` is the only package with a `sideEffects: true` flag (required for custom-element registration).
- No circular dependencies exist between packages.
