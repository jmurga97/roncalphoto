# 02 — Arquitectura del backend (`apps/api`)

La API es un Worker de Cloudflare construido con **Hono** y `@hono/zod-openapi`.
Sigue una arquitectura por capas estricta, modular y validada por ESLint. Este
documento describe el patrón real para que cualquier backend nuevo lo replique.

## Capas

```text
routes → services → repositories → db/schema
```

La regla de import es **unidireccional**: una capa solo puede importar de la
capa inmediatamente inferior (y de `src/shared/`). ESLint enforce estos límites.

| Capa             | Carpeta                          | Responsabilidad                                                                        | Puede importar de        |
| ---------------- | -------------------------------- | -------------------------------------------------------------------------------------- | ------------------------ |
| **Routes**       | `src/modules/<m>/routes/`        | Contrato HTTP/OpenAPI, validación Zod de request/response, mapeo de errores a status.  | services, shared, config |
| **Services**     | `src/modules/<m>/services/`      | Lógica de negocio, orquestación de transacciones, reglas de dominio.                   | repositories, shared     |
| **Repositories** | `src/modules/<m>/repositories/`  | Acceso a datos con Drizzle. Sin lógica de negocio.                                      | db, shared               |
| **DB / schema**  | `src/db/`                        | Tablas Drizzle, relaciones, migraciones.                                                | —                        |

## Estructura de un módulo

Cada dominio es un **módulo aislado** bajo `src/modules/`. Los módulos **no se
importan entre sí**; lo común vive en `src/shared/`.

```text
src/modules/sessions/
├── routes.ts                      # agrega los handlers del módulo en un router Hono
├── routes/
│   ├── list-sessions.ts           # un archivo por endpoint
│   ├── get-session.ts
│   ├── create-session.ts
│   ├── update-session.ts
│   └── delete-session.ts
├── services/
│   └── sessions.service.ts        # clase + factory cacheada por binding
├── repositories/
│   └── sessions.repository.ts     # clase + factory cacheada por binding
└── schemas/
    └── sessions.schema.ts         # esquemas Zod de request/response
```

Módulos actuales: `sessions`, `photos`, `tags`, `photo-uploads`,
`client-deliveries`. (El doc original menciona también `deliveries`; la fuente
de verdad es `src/modules/`.)

## Registro de rutas

`src/app/routes.ts` monta cada router de módulo bajo su prefijo:

```ts
export function registerRoutes(app: OpenApiApp) {
  app.route("/api/sessions", sessionsRoutes);
  app.route("/api/photos", photosRoutes);
  app.route("/api/photo-uploads", photoUploadsRoutes);
  app.route("/api/tags", tagsRoutes);
  app.route("/api/client-deliveries", clientDeliveriesRoutes);
}
```

`src/app/create-app.ts` es la _factory_ de la app: instala el logger (pino),
parsea el entorno en el contexto, configura CORS (uno específico para
`/api/auth/*`), monta Better Auth, expone `/health` y `/`, registra las rutas y
fija los handlers `notFound` y `onError`.

## Patrón de instancia por binding (singletons)

Services y repositories se construyen una sola vez por binding de D1 mediante un
`WeakMap` cacheado. Esto evita reconstruir dependencias en cada request dentro
del mismo aislamiento de Worker.

```ts
const sessionsServiceInstances = new WeakMap<D1Database, SessionsService>();

export function getSessionsService(client: D1Database): SessionsService {
  return getOrCreateInstance(
    sessionsServiceInstances,
    client,
    () => new SessionsService(getSessionsRepository(client)),
  );
}
```

Las clases reciben sus dependencias por constructor (inyección manual); el
factory las cablea. Es el patrón singleton "ligero" que el repo prefiere frente
a un contenedor DI.

## Contratos con Zod OpenAPI

Cada endpoint se declara con `createApiRoute` (wrapper de `@hono/zod-openapi`):
método, path, middleware, tags, schemas de request (headers/body/query) y mapa
de respuestas (éxito + errores). El handler valida con `context.req.valid(...)`
y responde con helpers (`jsonSuccess`). Ejemplo real (subida de foto):

```ts
const route = createApiRoute({
  method: "post",
  path: "/",
  middleware: requireSession,
  tags: ["Photo uploads"],
  request: { headers: photoUploadHeadersSchema, body: { /* Zod */ } },
  errorResponses: {
    ...protectedValidationErrorResponses,
    [CONFLICT]: createErrorResponse("Idempotency conflict"),
    [SERVICE_UNAVAILABLE]: createErrorResponse("Image service is unavailable"),
  },
  responses: { [CREATED]: { /* schema de salida */ } },
});

export default createRouter().openapi(route, async (context) => {
  const input = context.req.valid("json");
  const service = getPhotoUploadsService(context.env.DB_RONCALPHOTO, context.env.IMAGE_WORKER);
  const result = await service.createUpload(/* ... */);
  return jsonSuccess(context, result, CREATED);
});
```

El envelope de respuesta es consistente: `{ success: true, data }` o
`{ success: false, error: { code, message } }`.

## Base de datos: D1 + Drizzle

- Esquema en `src/db/schema/` (más `auth.ts` para las tablas de Better Auth).
- Tablas con `text("id").primaryKey()` (IDs string generados en la app), índices
  explícitos, `uniqueIndex` para slugs/tokens, FKs con `onDelete: "cascade"`.
- Timestamps como `text` con `default(sql\`CURRENT_TIMESTAMP\`)`.
- Relaciones declaradas con `relations(...)` de Drizzle.
- Migraciones en `src/db/migrations/`, generadas con `drizzle-kit generate`,
  aplicadas con `wrangler d1 migrations apply ... --remote`.

Estados de procesos asíncronos se modelan como columnas `status` con enum
acotado (p. ej. `photo_upload_jobs.status ∈ {awaiting_upload, queued,
processing, done, error}`). Este patrón se reutiliza para cualquier pipeline
asíncrono.

### Idempotencia y subidas pendientes

La tabla `pending_photo_uploads` muestra el patrón canónico de subida idempotente:

- `idempotency_key` único por request del cliente.
- `request_fingerprint` (hash SHA-256 del payload normalizado) para detectar
  reuso de la misma clave con datos distintos → `409 Conflict`.
- `status ∈ {pending, finalized}` y finalización al confirmarse el procesado.

Es el modelo a copiar para subir notas de voz en el producto nuevo.

## Configuración y entorno

- `src/config/env/schema.ts` valida el entorno con Zod. Los _service bindings_
  se tipan con `z.custom<...>` comprobando que exista `fetch`.
- Variables no secretas en `wrangler.toml [vars]`; secretos por
  `wrangler secret` / dashboard. Nunca mezclar credenciales de despliegue con
  runtime (ver [03](./03-infraestructura-cloudflare.md) y `cloudflare-production.md`).

## Errores

- `HttpError(status, message)` en `src/shared/errors/` se lanza desde services
  y repositories.
- `map-error.ts` traduce errores a respuestas con envelope.
- `onErrorHandler` global captura lo no controlado.

## Convenciones de código (resumen)

- `strict: true` (`noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `strictNullChecks`).
- Sin `any`; usar `unknown` y estrechar.
- `import type` para tipos.
- Prettier: 100 cols, comillas dobles, trailing commas, 2 espacios.
- Límites ESLint: profundidad máx. 4, funciones máx. 80 líneas (componentes React: 260).
- Sin `console` salvo `console.error` y `console.log`.
- No mergear con errores de tipos ni de lint.

## Checklist para un módulo nuevo

1. Crear `src/modules/<m>/` con `schemas/`, `repositories/`, `services/`, `routes/`.
2. Definir tablas en `src/db/schema/` + `relations`.
3. `bun run db:generate` y revisar el SQL.
4. Repository (Drizzle, sin negocio) con factory `WeakMap`.
5. Service (negocio, transacciones) con factory `WeakMap`.
6. Un archivo por endpoint en `routes/`, agregados en `routes.ts`.
7. Montar el router en `src/app/routes.ts`.
8. `bun run check` y `bun run lint`.
