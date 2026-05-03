# RoncalPhoto

Portfolio web para fotografo profesional. Monorepo con Bun workspaces, frontend publico en `apps/photos`, dashboard en `apps/photos-admin`, API en `apps/api` y tipos compartidos en `packages/shared`.

## Stack tecnico

- Monorepo: Turborepo + Bun workspaces
- Frontend (`apps/photos`): Vite, React 19, TanStack Router, Tailwind CSS 4
- API (`apps/api`): Hono, Cloudflare Workers, D1
- Shared (`packages/shared`): TypeScript domain types y mappers
- Lint/format: Biome
- Runtime: Bun

## Modelo de dominio

- La entidad principal es `Session`.
- Cada sesion tiene `1..n` tags.
- La ruta publica de sesion es `/session/:slug`.
- La API publica expone `sessions`, `tags` y `photos`.
- `GET /api/sessions` soporta `?include=photos` para hidratacion completa en una sola llamada.

## Estructura

```text
roncalphoto/
├── apps/
│   ├── photos/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── routes/
│   │   │   │   └── styles/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   ├── modules/
│   │   │   └── utils/
│   │   ├── public/
│   │   ├── vite.config.ts
│   │   └── wrangler.toml
│   └── api/
│       ├── src/
│       │   ├── app/
│       │   ├── config/
│       │   ├── db/
│       │   ├── modules/
│       │   └── shared/
│       ├── drizzle.config.ts
│       └── wrangler.toml
├── packages/
│   └── shared/
│       └── src/
├── package.json
├── turbo.json
├── tsconfig.json
└── biome.json
```

## Comandos

Desde la raiz del repo:

- `bun install`
- `bun run dev`
- `bun run build`
- `bun run check`
- `bun run lint`
- `bun run lint:fix`

Por paquete:

```bash
# Photos app
bunx turbo dev --filter=@roncal/photos-app
bunx turbo build --filter=@roncal/photos-app
bunx turbo check --filter=@roncal/photos-app

# API
bunx turbo dev --filter=@roncal/api
bunx turbo build --filter=@roncal/api
bun run --filter=@roncal/api deploy

# D1
bun run --filter=@roncal/api db:migrate:local
bun run --filter=@roncal/api db:migrate:remote
```

## Entorno

1. Instalar dependencias: `bun install`
2. Crear variables de entorno en la raiz del repo porque `apps/photos/vite.config.ts` y `apps/photos-admin/vite.config.ts` usan `envDir` apuntando a `../..`
3. Usar `VITE_API_URL` solo cuando quieras sobreescribir el origen del API. Sin override, el navegador usa `http://localhost:8787` en local y `https://api.roncalphoto.com` fuera de local. `API_URL` sigue aceptandose como alias legacy temporal.
4. Puertos locales por defecto:
   API `8787`, email worker `8788`, image optimizer `8789`, admin `5173`, photos `5174`
5. Para Workers usar `wrangler.toml` como contrato de produccion y `*.dev.vars` para overrides locales. El auth admin necesita `apps/api/.dev.vars` con `BETTER_AUTH_SECRET`, `EMAIL_WORKER_URL`, `EMAIL_WORKER_API_KEY` y `PHOTOS_ADMIN_URL`; las rutas publicas (`/api/sessions`, `/api/photos`, `/api/tags`) no dependen de esas variables
6. La matriz operativa completa de Cloudflare, secrets, bindings y orden de despliegue vive en [docs/cloudflare-production.md](/Users/murgapja/dev/roncalphoto/docs/cloudflare-production.md).

## Auth admin

- `apps/api` monta Better Auth en `/api/auth/*` y usa OTP por email.
- En produccion la API llama al worker de email mediante el service binding `EMAIL_WORKER`; en local puede usar el fallback `EMAIL_WORKER_URL` + `EMAIL_WORKER_API_KEY`.
- `EMAIL_WORKER_URL` debe apuntar al origen base del worker de email, por ejemplo `http://localhost:8788`; la API llamara a `/send/otp`.
- `EMAIL_WORKER_API_KEY` en la API debe coincidir con el secret `WORKER_API_KEY` del email worker cuando el fallback por URL este activo.
- `BETTER_AUTH_SECRET` y `PHOTOS_ADMIN_URL` son obligatorios para `/api/auth/*`. Tambien hace falta configurar el service binding `EMAIL_WORKER` o el fallback `EMAIL_WORKER_URL` + `EMAIL_WORKER_API_KEY`.
- `PHOTOS_ADMIN_URL` sigue siendo el origen canonico del dashboard; en desarrollo local el auth tambien tolera otros orígenes `localhost` configurados en `ALLOWED_ORIGINS`, para no depender de un puerto fijo si Vite cambia de `5173` a `5174` u otro permitido.
- El login admin tiene sign-up desactivado: antes del primer acceso debe existir un usuario en la tabla Better Auth `user` de D1.

## Notas

- `@roncal/shared` se consume como TypeScript source, sin build step propio.
- `apps/photos` usa TanStack Router y genera `src/app/route-tree.gen.ts` desde `src/app/routes`.
- La normalizacion de metadata de fotos ocurre en API/shared, no en UI.
- `worker-configuration.d.ts` se regenera con `bun run --filter=@roncal/api cf-typegen`.
- Los Workers del repo estandarizan su configuracion en `wrangler.toml`; `apps/api` y `apps/image-optimizer` ya no usan `wrangler.json`.
