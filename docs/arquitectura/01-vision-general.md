# 01 — Visión general de la arquitectura

RoncalPhoto es un **monorepo** (Turborepo + Bun workspaces) que aloja un
portafolio fotográfico profesional desplegado íntegramente sobre Cloudflare.

Este documento describe el mapa de alto nivel: piezas, responsabilidades y los
principios transversales que se repiten en todo el repositorio. Es la base
conceptual para los documentos 02 (backend), 03 (infraestructura) y 04 (reglas
para productos nuevos).

## Mapa del monorepo

```text
roncalphoto/
├── apps/
│   ├── api/            # tRPC API en Cloudflare Workers + D1 (Drizzle)
│   ├── photos/         # Galería pública — Vite + React 19 (SPA en Worker)
│   └── photos-admin/   # Dashboard admin — Vite + React 19 (auth-protected)
├── packages/
│   ├── db/             # @roncal/db — esquemas Drizzle, repositorios y mappers
│   ├── auth/           # @roncal/auth — factory de Better Auth (Email OTP)
│   └── ui/             # @roncal/ui — primitivos React compartidos
└── docs/               # documentación operativa y de arquitectura
```

Servicios **externos al monorepo**, consumidos por _service binding_:

- `ming-email-worker` — emails transaccionales (entrega de OTP). Repositorio standalone.
- `ming-image-worker` — procesamiento de imágenes (resize, miniaturas, R2). Repositorio standalone.

Ambos son **workers comunes multi-producto**: no pertenecen a RoncalPhoto, RoncalPhoto es solo uno de sus consumidores. Ver [documento 03](./03-infraestructura-cloudflare.md).

## Responsabilidades por pieza

| Pieza               | Tipo                       | Responsabilidad                                                                                |
| ------------------- | -------------------------- | ---------------------------------------------------------------------------------------------- |
| `apps/api`          | Worker (fetch nativo)      | Única fuente de verdad de negocio. Expone `/trpc` y `/api/auth/*`, habla con D1, R2 y workers. |
| `apps/photos`       | Worker (static assets SPA) | Frontend público de lectura. Consume la API.                                                   |
| `apps/photos-admin` | Worker (static assets SPA) | Backoffice autenticado (Better Auth). Sube fotos, gestiona sesiones.                           |
| `packages/db`       | Paquete TS                 | Esquemas, repositorios y mappers de D1.                                                        |
| `packages/auth`     | Paquete TS                 | Factory de Better Auth + cliente. Reusable entre productos.                                    |
| `ming-email-worker` | Worker común (externo)     | Envío transaccional interno. Nunca expuesto al navegador.                                      |
| `ming-image-worker` | Worker común (externo)     | Pipeline de subida/optimización de imágenes. Nunca expuesto al navegador.                      |

## Flujo de datos (lectura pública)

```mermaid
flowchart LR
    U["Visitante"] --> P["apps/photos (SPA)"]
    P -->|tRPC sessions.list| A["apps/api (Worker)"]
    A -->|Drizzle| D[("D1 — roncalphoto")]
    A -->|URLs públicas| R[("R2 — media")]
    P -->|<img src>| R
```

El frontend público nunca habla con D1 ni con workers internos: solo con la API.
La API normaliza filas de D1 (que pueden tener `null`) en sus mappers; `AppRouter`
exporta los tipos resultantes y sus alias inferidos para los clientes.

## Flujo de escritura (admin + media)

```mermaid
flowchart LR
    Adm["apps/photos-admin"] -->|tRPC photoUploads.create| A["apps/api"]
    A -->|service binding| IW["ming-image-worker"]
    IW -->|URL PUT firmada| Adm
    Adm -->|PUT original| R2o[("R2 originals")]
    R2o -->|object-create → Queue| IW
    IW -->|main + thumbnail| R2m[("R2 media")]
    Adm -->|tRPC photoUploads.get (poll)| A
```

Este patrón —**reserva de ID, subida directa a R2 con URL firmada,
procesamiento asíncrono por cola, _polling_ de estado**— es el patrón de
referencia para cualquier media pesada del ecosistema (incluidas las notas de
voz del producto nuevo). Se detalla en los documentos 02 y 04.

## Principios transversales

Estos principios se cumplen hoy en RoncalPhoto y son obligatorios para productos nuevos:

1. **Todo corre en Cloudflare Workers.** Sin servidores tradicionales ni contenedores.
2. **La API es la única autoridad de negocio.** Frontends y clientes móviles solo consumen la API.
3. **Los workers comunes son servicios internos.** Se invocan por _service binding_, nunca se exponen a Internet ni al navegador/cliente. La capa pública y antiabuso vive en la API del producto.
4. **Arquitectura por capas estricta** en el backend: `router tRPC → services → @roncal/db repositories → D1`, validada por lint (ver [02](./02-arquitectura-backend.md)).
5. **Módulos aislados.** Los módulos de negocio no se importan entre sí; lo compartido vive en `src/shared/`.
6. **Tipos de dominio no nullables** inferidos desde `@roncal/api/router`; la API normaliza los `null` de D1.
7. **Migraciones expand/contract.** Cambios de esquema compatibles hacia atrás antes de retirar formas viejas.
8. **Separación credenciales de despliegue vs. variables de runtime** (ver [`cloudflare-production.md`](../cloudflare-production.md)).
9. **Bun como único gestor de paquetes.** Nada de npm/yarn/pnpm.
10. **`strict: true` en TypeScript**, sin `any`, con Zod para validación de límites.

## Stack resumido

- **Monorepo**: Turborepo + Bun workspaces.
- **Backend**: fetch nativo de Cloudflare Workers y tRPC para contratos inferidos.
- **Base de datos**: D1 (SQLite) con Drizzle ORM y migraciones generadas por Drizzle Kit.
- **Almacenamiento**: R2 para binarios (imágenes).
- **Auth**: Better Auth con Email OTP (`packages/auth`).
- **Frontend**: Vite + React 19, TanStack Router/Query, Zustand, Tailwind 4.
- **Validación**: Zod 4 en todos los límites de entrada/salida.
- **Lint/format**: Oxlint + Oxfmt.
