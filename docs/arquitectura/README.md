# Arquitectura — RoncalPhoto y reglas para nuevos productos

Esta carpeta recopila la arquitectura real del monorepo `roncalphoto` y la
formaliza como un conjunto de reglas reutilizables para nuevos proyectos sobre
la misma cuenta de Cloudflare.

El objetivo es doble:

1. **Documentar lo que ya existe** — apps, paquetes, capas del backend y la
   infraestructura Cloudflare (workers comunes de email e imagen, D1, R2,
   service bindings, despliegue).
2. **Fijar reglas de backend e infraestructura** que un producto nuevo debe
   seguir para encajar en este ecosistema. El caso concreto desarrollado aquí
   es una **app de citas por notas de voz** (React Native + Expo).

## Documentos

| #   | Documento                                                                                      | Qué cubre                                                                                                  |
| --- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 01  | [Visión general](./01-vision-general.md)                                                       | Mapa del monorepo, apps, paquetes, flujo de datos y principios transversales.                              |
| 02  | [Arquitectura del backend](./02-arquitectura-backend.md)                                       | Capas `routes → services → repositories → db`, módulos, Hono + Zod OpenAPI, D1 + Drizzle, convenciones.    |
| 03  | [Infraestructura Cloudflare](./03-infraestructura-cloudflare.md)                               | Workers, D1, R2, Queues, service bindings, workers comunes (`ming-email-worker`, `ming-image-worker`), despliegue. |
| 04  | [Reglas de backend e infra para nuevos productos](./04-reglas-backend-infra-nuevos-productos.md) | **Documento normativo.** Reglas adaptadas a la app de citas por notas de voz con Expo.                     |

## Documentos relacionados (preexistentes)

- [`docs/cloudflare-production.md`](../cloudflare-production.md) — fuente operativa de despliegue y separación de credenciales.
- [`docs/email-worker-auditoria-worker-comun.md`](../email-worker-auditoria-worker-comun.md) — diseño del worker común de email como servicio interno.
- [`docs/auth-flow-guide.md`](../auth-flow-guide.md) — flujo de autenticación con Better Auth + Email OTP.

## Cómo leer esta serie

- Si vas a **entender RoncalPhoto**: lee 01 → 02 → 03.
- Si vas a **arrancar el producto nuevo**: lee 01 (para el lenguaje común) y luego salta directo al 04, que es prescriptivo.
