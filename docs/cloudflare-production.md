# Cloudflare Production

Referencia unica para dejar `auth`, `email-worker`, `photos-admin`, `photos` e `image-optimizer` coherentes en produccion.

## Topologia canonica

- `https://roncalphoto.com`: frontend publico (`apps/photos`)
- `https://admin.roncalphoto.com`: dashboard (`apps/photos-admin`)
- `https://api.roncalphoto.com`: API + Better Auth (`apps/api`)
- `https://media.roncalphoto.com`: media publica generada por `apps/image-optimizer`
- `roncalphoto-email-worker`: worker interno para OTP, consumido por service binding

## Recursos obligatorios

| Pieza | Tipo Cloudflare | Nombre esperado | Uso |
| --- | --- | --- | --- |
| API | Worker | `roncalphoto-api` | API publica y rutas `/api/auth/*` |
| Email | Worker | `roncalphoto-email-worker` | Envio OTP via service binding |
| Publico | Pages | `roncalphoto-photos` | Site publico |
| Admin | Pages | `roncalphoto-photos-admin` | Dashboard autenticado |
| D1 | D1 | `roncalphoto` | Datos de portfolio y tablas Better Auth |
| Originals | R2 | `roncalphoto-originals` | Subidas fuente |
| Media | R2 | `roncalphoto-media` | Assets publicos procesados |
| Queue | Queues | `roncalphoto-image-processing` | Procesado asincrono de imagenes |
| Mail | Email binding | `SEND_EMAIL` | Entrega transaccional del worker de email |

## Contrato por app

### `apps/api`

Bindings:

- `DB_RONCALPHOTO`
- `EMAIL_WORKER`

Vars:

- `ALLOWED_ORIGINS=https://admin.roncalphoto.com,https://roncalphoto.com`
- `LOG_LEVEL=info`
- `NODE_ENV=production`
- `PHOTOS_ADMIN_URL=https://admin.roncalphoto.com`

Secrets:

- `BETTER_AUTH_SECRET`

Dev fallback only:

- `EMAIL_WORKER_URL`
- `EMAIL_WORKER_API_KEY`

### `apps/email-worker`

Bindings:

- `SEND_EMAIL`

Vars:

- `FROM_EMAIL`
- `FROM_NAME=RoncalPhoto`

Secrets:

- ninguno en produccion si solo se usa por service binding

Dev fallback only:

- `WORKER_API_KEY`

### `apps/photos-admin`

Secrets:

- ninguno

Build-time overrides opcionales:

- `VITE_API_URL`

Notas:

- si no defines `VITE_API_URL`, la app usa `https://api.roncalphoto.com` en produccion
- `API_URL` queda solo como alias legacy temporal

### `apps/photos`

Secrets:

- ninguno

Build-time overrides opcionales:

- `VITE_API_URL`

### `apps/image-optimizer`

Bindings:

- `IMAGES`
- `DB_RONCALPHOTO`
- `ORIGINALS_BUCKET`
- `MEDIA_BUCKET`
- `IMAGE_PROCESSING_QUEUE`

Vars:

- `ALLOWED_ORIGINS=https://admin.roncalphoto.com,https://roncalphoto.com`
- `NODE_ENV=production`
- `PUBLIC_MEDIA_BASE_URL=https://media.roncalphoto.com`
- `R2_ACCOUNT_ID`
- `R2_ORIGINALS_BUCKET_NAME=roncalphoto-originals`

Secrets:

- `ADMIN_UPLOAD_TOKEN`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

## Archivos fuente de verdad

- Produccion Worker/Page config: `apps/*/wrangler.toml`
- Local Worker overrides: `apps/*/.dev.vars`
- Frontend local overrides: `/.env`
- Tooling/CI secret de Cloudflare: `CLOUDFLARE_API_TOKEN`
- Drizzle HTTP opcional: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `CLOUDFLARE_D1_TOKEN`

## Orden recomendado

1. Crear o validar D1 `roncalphoto`.
2. Aplicar migraciones remotas desde `apps/api`, incluida `0004_better_auth.sql`.
3. Desplegar `roncalphoto-email-worker`.
4. Desplegar `roncalphoto-api` con `BETTER_AUTH_SECRET` y el service binding `EMAIL_WORKER`.
5. Crear/verificar `roncalphoto-originals`, `roncalphoto-media` y `roncalphoto-image-processing`.
6. Desplegar `roncalphoto-image-optimizer`.
7. Desplegar `roncalphoto-photos` y `roncalphoto-photos-admin`.
8. Asociar dominios canonicos `roncalphoto.com`, `admin.roncalphoto.com`, `api.roncalphoto.com` y `media.roncalphoto.com`.

## Checklist de validacion

- `GET https://api.roncalphoto.com/health` responde `200`.
- `https://admin.roncalphoto.com/login` solicita OTP y lo entrega por email.
- El login OTP crea sesion y el admin puede leer/escribir contra `/api/*`.
- `/api/auth/*` acepta solo `https://admin.roncalphoto.com`.
- El resto de `/api/*` acepta `https://admin.roncalphoto.com` y `https://roncalphoto.com`.
- `https://roncalphoto.com` resuelve datos sin depender de `VITE_API_URL`.

## Nota de auditoria

La validacion real de secretos, bindings, Pages y Workers en la cuenta de Cloudflare requiere exponer `CLOUDFLARE_API_TOKEN` a `wrangler` en este entorno. Mientras eso no ocurra, este documento y los `wrangler.toml` del repo son la referencia operativa.
