# RoncalPhoto

Portfolio web para fotógrafo profesional. Monorepo con Turborepo, Bun workspaces y paquete de tipos compartido.

## Stack Técnico

- **Monorepo**: Turborepo + Bun workspaces
- **Frontend** (`apps/web`): Astro 5, React 19, Tailwind CSS 4, GSAP
- **API** (`apps/api`): Hono, Cloudflare Workers, D1
- **Shared** (`packages/shared`): TypeScript domain types
- **Linting/Formatting**: Biome
- **Runtime**: Bun
- **Lenguaje**: TypeScript (modo estricto)

## Estructura del Proyecto

```
roncalphoto/
├── apps/
│   ├── web/                  # Astro frontend (@roncal/web)
│   │   ├── src/
│   │   │   ├── components/   # Astro + React components
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   ├── lib/          # API client, animations
│   │   │   ├── utils/        # Helper functions
│   │   │   └── styles/       # Tailwind global.css
│   │   ├── public/
│   │   ├── astro.config.mjs
│   │   └── wrangler.toml
│   └── api/                  # Hono API (@roncal/api)
│       ├── src/
│       │   ├── db/           # D1 queries
│       │   ├── middleware/   # Auth, CORS
│       │   ├── routes/       # Category, session, photo routes
│       │   └── types/        # DB rows, DTOs, Env
│       ├── migrations/       # D1 SQL migrations
│       └── wrangler.json
├── packages/
│   └── shared/               # Shared types (@roncal/shared)
│       └── src/
│           ├── types.ts      # Domain types (Photo, Session, Category, etc.)
│           └── index.ts      # Barrel export
├── package.json              # Root workspace config
├── turbo.json                # Turborepo pipeline
├── tsconfig.json             # Base TypeScript config
├── biome.json                # Biome linter/formatter
└── .env.example              # Environment template
```

## Comandos

Todos los comandos se ejecutan desde la raíz del monorepo:

| Comando               | Accion                                              |
| :-------------------- | :-------------------------------------------------- |
| `bun install`         | Instala dependencias y enlaza workspaces             |
| `bun run dev`         | Inicia ambos servidores de desarrollo (turbo)        |
| `bun run build`       | Build de produccion de todos los paquetes            |
| `bun run check`       | Verifica tipos TypeScript en todos los paquetes      |
| `bun run lint`        | Lint con Biome                                       |
| `bun run lint:fix`    | Auto-fix Biome issues                                |
| `bun run format`      | Formatea con Biome                                   |

### Comandos por paquete

```bash
# Frontend (Astro)
bunx turbo dev --filter=@roncal/web
bunx turbo build --filter=@roncal/web
bunx turbo check --filter=@roncal/web

# API (Hono/Workers)
bunx turbo dev --filter=@roncal/api        # Runs wrangler dev (migrates D1 local first)
bunx turbo build --filter=@roncal/api      # Dry-run deploy
bun run --filter=@roncal/api deploy        # Deploy to Cloudflare

# D1 Database
bun run --filter=@roncal/api db:migrate:local
bun run --filter=@roncal/api db:migrate:remote
```

## Desarrollo

```bash
# 1. Instalar dependencias
bun install

# 2. Configurar variables de entorno
cp .env.example apps/web/.env
# Edit apps/web/.env with API_URL and API_KEY
# For api, create apps/api/.dev.vars with API_KEY and ALLOWED_ORIGINS

# 3. Start API first (needed for web build)
bunx turbo dev --filter=@roncal/api

# 4. In another terminal, start web
bunx turbo dev --filter=@roncal/web

# Or run both:
bun run dev
```

## Paquete Compartido (@roncal/shared)

El paquete `@roncal/shared` contiene los tipos de dominio canonicos compartidos entre frontend y API:

- `PhotoMetadata`, `PhotoSummary`, `Photo`
- `SessionSummary`, `Session`
- `CategorySummary`, `Category`
- `ApiResponse<T>`, `PaginatedResponse<T>`

**Convencion**: Todos los campos son non-nullable. La API transforma nulls de D1 a valores por defecto.

No tiene paso de build — ambos bundlers (Astro/Vite y Wrangler) consumen TypeScript source directamente via el campo `exports` en package.json.

## Notas

- **Web build**: Requiere que la API este corriendo (hace fetch en build-time para `getStaticPaths`)
- **API build**: `wrangler deploy --dry-run` — no requiere red
- **worker-configuration.d.ts**: Auto-generado con `bun run --filter=@roncal/api cf-typegen`, gitignored
