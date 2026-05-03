# agents.md - RoncalPhoto Portfolio

## Contexto

Monorepo para portfolio de fotografia profesional.

- `apps/photos`: frontend publico con Vite + React, desplegado en Cloudflare
- `apps/photos-admin`: dashboard protegido por auth
- `apps/api`: backend con Hono sobre Cloudflare Workers + D1
- `apps/email-worker`: worker para enviar OTPs de inicio de sesion por email
- `apps/image-optimizer`: logica para transformar imagenes subidas a R2 y persistir sus datos en base de datos
- `packages/auth`: configuracion de Better Auth para autenticacion por OTP via email
- `packages/murga-components`: libreria de componentes Lit para el dashboard admin
- `packages/shared`: tipos compartidos del dominio
- Runtime y package manager: Bun

El dominio actual usa sesiones etiquetadas con tags (`1..n` por sesion).
La ruta principal es `/session/:slug`.

## Stack

- Turborepo + Bun workspaces
- Vite + React 19 + TanStack Router + Tailwind CSS 4
- Hono + D1
- Biome para lint y formato
- TypeScript estricto

## Convenciones

### Package manager
- Usar solo Bun.

### TypeScript
- `strict: true`
- Evitar `any`
- Mantener tipos no-nullable en `@roncal/shared`

### Estilos
- Tailwind CSS
- Evitar duplicacion de clases
- Priorizar legibilidad

### Accesibilidad
- HTML semantico
- ARIA donde aplique
- Navegacion por teclado completa

## Estructura de carpetas

```text
roncalphoto/
├── apps/
│   ├── api/
│   ├── email-worker/
│   ├── image-optimizer/
│   ├── photos/
│   └── photos-admin/
├── packages/
│   ├── auth/
│   ├── email-templates/
│   ├── murga-components/
│   ├── shared/
│   │   └── src/
│   │       ├── types.ts
│   │       ├── mappers.ts
│   │       ├── normalizers.ts
│   │       └── index.ts
│   └── ui/
├── package.json
├── turbo.json
├── tsconfig.json
└── biome.json
```

## Modelo de datos

Tipos canonicos en `packages/shared/src/types.ts`:

- `PhotoMetadata`
- `PhotoSummary`
- `Photo`
- `Tag`
- `SessionSummary`
- `Session`
- `ApiPhoto`
- `ApiSession`
- `ApiTagWithSessions`
- `ApiResponse<T>`
- `PaginatedResponse<T>`

Convencion: los tipos compartidos son non-nullable; la API normaliza valores nulos de D1.

## UI/UX

- Layout fijo a `100vh`
- Sidebar en desktop y modo overlay en mobile
- Galeria con foto principal + miniaturas
- Vistas del frontend organizadas en `src/pages/*`; `src/components/*` contiene piezas reutilizables
- Navegacion por teclado con flechas y `Esc`
- Transiciones suaves y animaciones CSS

## Calidad

Comandos principales:

```bash
bun run lint
bun run check
bun run build
```

Reglas:

- No mergear con errores de tipos o lint.
- Medir antes de optimizar performance.

## API y rutas

- `GET /api/sessions` (`include=photos` opcional)
- `GET /api/sessions/:slug`
- `GET /api/tags`
- `GET /api/tags/:slug`
- `GET /api/photos`
- `GET /api/photos/:id`
- Ruta web principal: `/session/:slug`

## Commits y PRs

Titulo:

```text
[roncalphoto] Descripcion clara y concisa
```

PR debe incluir:

- Que cambio
- Por que
- Como se verifico

## Notas finales

- Frontend y API se despliegan en Cloudflare.
- D1 contiene datos de sesiones, tags y fotos.
- `@roncal/shared` no tiene build step propio.
- Este documento es vivo: actualizar cuando cambien decisiones o restricciones.
