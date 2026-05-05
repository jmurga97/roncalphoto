# RoncalPhoto — Shared Packages

This directory contains code that is reused across two or more apps in the monorepo. The rule of thumb is: if a module is imported by more than one app, or if it defines canonical domain types that must stay in sync between the API and the frontends, it belongs here.

Packages are consumed as TypeScript source (no dedicated build step) unless they require their own test runner or special compilation. This keeps the workspace fast and avoids stale declaration files.

---

## Package Index

| Package | Purpose | Consumed by |
|---------|---------|-------------|
| `@roncal/auth` | Reusable Better Auth server factory, Email OTP configuration, email-worker sender helper, and React Email OTP client factory. | `apps/api`, `apps/photos-admin` |
| `@roncal/email-templates` | React Email templates (OTP email) rendered to HTML and plain text. | `apps/email-worker` |
| `@murga/components` | Lit-based custom elements library with React wrappers for the admin dashboard. | `apps/photos-admin` |
| `@roncal/shared` | Canonical domain types (`Photo`, `Session`, `Tag`, …), API mappers (`apiPhotoToPhoto`), normalizers, and runtime helpers (`resolveApiBaseUrl`). | `apps/api`, `apps/photos`, `apps/photos-admin` |
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
```

### Notes

- `@roncal/shared` is the single source of truth for the domain model. The API transforms D1 rows into these types, and the frontends consume them directly.
- `@roncal/auth` is intentionally domain-agnostic: callers pass `baseURL`, Drizzle schema, trusted origins, and OTP delivery. It does not depend on `@roncal/shared`.
- `@murga/components` is the only package with a `sideEffects: true` flag (required for custom-element registration).
- No circular dependencies exist between packages.
