# 02 — Arquitectura del backend

RoncalPhoto sigue la arquitectura de Qmenut: Worker con `fetch` nativo, tRPC,
Drizzle y repositorios en `packages/db`.

```text
router tRPC → servicios → repositorios @roncal/db → D1
```

## Límites

- `apps/api/src/index.ts` despacha `/health`, `/api/auth/*` y `/trpc` y aplica CORS.
- `src/trpc/context.ts` crea el cliente DB por petición y resuelve auth de forma perezosa.
- `src/trpc/trpc.ts` define procedimientos públicos/protegidos y la traducción de errores.
- Cada módulo conserva su router, inputs Zod y servicio de negocio; los módulos no se importan entre sí.
- `packages/db` es dueño de esquemas, relaciones, consultas y mappers; no importa apps ni el router de la API.
- `@roncal/api/router` exporta `AppRouter` y los tipos de cliente inferidos; los frontends solo los importan como tipos.

## Contrato y datos

`RouterInputs` se infiere de los esquemas Zod de los procedimientos y `RouterOutputs` de los
resultados de servicios y mappers. `Session`, `Photo`, `PhotoMetadata` y `Tag` son alias de esos
outputs; no se mantienen DTOs manuales ni una copia del contrato en otro paquete.

Los mappers de `packages/db` normalizan los `NULL` de D1 antes de que las filas lleguen a los
servicios. Las escrituras que actualizan varias tablas usan `db.batch()` para conservar la
atomicidad. Las restricciones de D1 validan referencias y unicidad.

## Persistencia y migraciones

`packages/db/src/schema/index.ts` es el único entrypoint de Drizzle Kit. Para cambios de esquema,
editar TypeScript, ejecutar `bun run db:generate -- --name <cambio>` y versionar el SQL y metadata
juntos. Wrangler ejecuta las migraciones; no usar `push`, escribir DDL a mano ni editar SQL aplicado.

## Servicios internos

La API reserva metadata e ID de una foto, llama a `IMAGE_WORKER` por RPC y finaliza la foto al
consultar un upload completado. Better Auth consume `ming-email-worker` por service binding para
mandar los códigos OTP.

## Validación y entrega

Antes de mergear deben pasar `bun run check`, `bun run lint` y `bun run build`. No se cambia el
modelo de datos ni se reinicia D1 para esta arquitectura. La entrega publica API, web y admin de
forma coordinada porque los clientes compilan contra el contrato tRPC de la API.
