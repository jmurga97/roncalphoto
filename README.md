# RoncalPhoto

Portfolio web para fotografo profesional. Monorepo con Bun workspaces, frontend en `apps/photos`, API en `apps/api` y tipos compartidos en `packages/shared`.

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
│       └── wrangler.json
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
2. Crear variables de entorno en la raiz del repo porque `apps/photos/vite.config.ts` usa `envDir` apuntando a `../..`
3. Definir `API_URL` o `VITE_API_URL` para la API
4. Para API local crear `apps/api/.dev.vars` con `ALLOWED_ORIGINS` incluyendo los hosts de frontend local que uses, por ejemplo `http://localhost:5173`

## Notas

- `@roncal/shared` se consume como TypeScript source, sin build step propio.
- `apps/photos` usa TanStack Router y genera `src/app/route-tree.gen.ts` desde `src/app/routes`.
- La normalizacion de metadata de fotos ocurre en API/shared, no en UI.
- `worker-configuration.d.ts` se regenera con `bun run --filter=@roncal/api cf-typegen`.
