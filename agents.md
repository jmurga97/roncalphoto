# agents.md — RoncalPhoto

Las instrucciones para agentes viven en [`CLAUDE.md`](./CLAUDE.md) y la documentación completa
(arquitectura, modelo de datos, API, flujos, despliegue) en [`README.md`](./README.md). Léelos antes
de cambiar código; este archivo no duplica su contenido para que no se desactualice.

Resumen mínimo:

- Solo Bun. `bun run check`, `bun run lint` y `bun run build` deben pasar antes de mergear.
- API: `router tRPC → servicio → repositorio @roncal/db → D1`; los módulos no se importan entre sí.
- Los clientes usan `trpc.x.queryOptions()` / `mutationOptions()`; los tipos se infieren de
  `AppRouter`, nunca se copian a mano.
- Esquema en `packages/db/src/schema/`; migraciones con `bun run db:generate -- --name <cambio>`.
- No añadir tests en este refactor.
