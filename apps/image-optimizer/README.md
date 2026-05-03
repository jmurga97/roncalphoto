# RoncalPhoto Image Optimizer

Worker interno para preparar imagenes del portfolio. No es una API publica de compresion generica:
esta pensado para el dashboard del fotografo, subidas grandes a R2 y procesamiento asincrono con
Cloudflare Queues.

## Que hace

El servicio recibe una solicitud de subida, genera una URL presigned para que el navegador suba el
original directamente a R2 y, cuando el dashboard confirma que la subida termino, encola un job por
foto. El consumer de la Queue transforma cada original con Cloudflare Images y persiste los outputs.

Flujo completo:

```text
Dashboard
  -> POST /api/images/uploads
  <- uploadUrl presigned + uploadId

Browser
  -> PUT directo a R2 ORIGINALS_BUCKET

Dashboard
  -> POST /api/images/uploads/complete

Queue consumer
  -> lee original de R2
  -> genera main.webp 1920px quality 85
  -> genera thumb.webp 480px quality 80
  -> guarda outputs en MEDIA_BUCKET
  -> upsert en photos.url y photos.miniature
  -> marca photo_upload_jobs como done o error
```

## Bindings y variables

`wrangler.toml` espera estos bindings:

- `IMAGES`: Cloudflare Images binding.
- `DB_RONCALPHOTO`: D1 compartida con la API.
- `ORIGINALS_BUCKET`: bucket privado para originales.
- `MEDIA_BUCKET`: bucket publico o con custom domain para imagenes servidas al portfolio.
- `IMAGE_PROCESSING_QUEUE`: Queue `roncalphoto-image-processing`.

Variables configuradas en `wrangler.toml`:

- `PUBLIC_MEDIA_BASE_URL`: base publica para construir `photos.url` y `photos.miniature`.
- `R2_ACCOUNT_ID`: account id de Cloudflare para firmar URLs S3-compatible.
- `R2_ORIGINALS_BUCKET_NAME`: nombre real del bucket de originales.
- `ALLOWED_ORIGINS`, `NODE_ENV`.

Secrets requeridos:

- `ADMIN_UPLOAD_TOKEN`: token bearer para endpoints internos.
- `R2_ACCESS_KEY_ID`: access key S3-compatible de R2.
- `R2_SECRET_ACCESS_KEY`: secret key S3-compatible de R2.

## Endpoints

Todos los endpoints de upload requieren:

```http
Authorization: Bearer <ADMIN_UPLOAD_TOKEN>
```

### `POST /api/images/uploads`

Crea jobs en D1 y devuelve URLs presigned para subir originales a R2.

Body:

```json
{
  "sessionId": "sess-urban-lines",
  "files": [
    {
      "filename": "photo.jpg",
      "contentType": "image/jpeg",
      "sizeBytes": 25000000,
      "alt": "Retrato editorial a contraluz",
      "about": "Contexto de la imagen",
      "sortOrder": 0,
      "metadata": {
        "iso": 400,
        "aperture": "f/2.8",
        "shutterSpeed": "1/250",
        "lens": "85mm f/1.8",
        "camera": "Canon EOS R5"
      }
    }
  ]
}
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "uploads": [
      {
        "uploadId": "...",
        "photoId": "...",
        "uploadUrl": "https://...",
        "originalKey": "sessions/.../original/photo.jpg",
        "mainKey": "sessions/.../main.webp",
        "thumbnailKey": "sessions/.../thumb.webp",
        "expiresAt": "2026-05-02T12:00:00.000Z",
        "headers": {
          "Content-Type": "image/jpeg"
        }
      }
    ]
  }
}
```

El browser debe hacer `PUT uploadUrl` usando exactamente los headers devueltos.

### `POST /api/images/uploads/complete`

Confirma que los originales ya estan en R2. El Worker verifica cada objeto, marca el job como
`queued` y envia un mensaje a la Queue.

```json
{
  "uploadIds": ["..."]
}
```

### `GET /api/images/uploads?sessionId=...`

Devuelve jobs y progreso agregado para que el dashboard pueda pintar estado.

Estados posibles:

- `awaiting_upload`
- `queued`
- `processing`
- `done`
- `error`

### `POST /api/images/uploads/:uploadId/retry`

Reencola un job en `error`. Solo funciona si el original sigue existiendo en `ORIGINALS_BUCKET`.

## Datos persistidos

La migracion `apps/api/src/db/migrations/0003_photo_upload_jobs.sql` crea
`photo_upload_jobs`. Esta tabla guarda el estado operativo del pipeline y los datos necesarios para
crear o actualizar la fila final de `photos`.

La tabla `photos` no cambia. El optimizer escribe:

- `url`: URL publica del `main.webp`.
- `miniature`: URL publica del `thumb.webp`.
- copy, orden y metadata tecnica recibidos al crear el upload.

## Perfiles de imagen

Los perfiles viven en `src/modules/images/profiles.ts`.

- `portfolio-main`: width `1920`, fit `scale-down`, WebP, quality `85`.
- `portfolio-thumbnail`: width `480`, fit `scale-down`, WebP, quality `80`.

RAW no se procesa en v1. El input aceptado es JPEG, PNG o WebP.

## Proximos pasos en Cloudflare

1. Crear buckets R2:

```bash
wrangler r2 bucket create roncalphoto-originals
wrangler r2 bucket create roncalphoto-media
```

2. Hacer publico el bucket de media o asociarle un custom domain/CDN.

Actualizar `PUBLIC_MEDIA_BASE_URL` con la URL final, por ejemplo:

```bash
wrangler deploy --var PUBLIC_MEDIA_BASE_URL:https://media.roncalphoto.com
```

3. Crear la Queue:

```bash
wrangler queues create roncalphoto-image-processing
```

4. Crear credenciales S3-compatible de R2 con permisos sobre `roncalphoto-originals`.

Guardar secrets en `apps/image-optimizer/.dev.vars` para local o via `wrangler secret put` para remoto:

```bash
wrangler secret put ADMIN_UPLOAD_TOKEN
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
```

5. Sustituir placeholders de `wrangler.toml`:

- `R2_ACCOUNT_ID`
- `R2_ORIGINALS_BUCKET_NAME`
- `PUBLIC_MEDIA_BASE_URL`

6. Aplicar migraciones D1:

```bash
cd ../api
wrangler d1 migrations apply DB_RONCALPHOTO --remote
```

7. Desplegar el worker:

```bash
cd ../image-optimizer
bun run deploy
```

8. Conectar el dashboard:

- Pedir presigned URLs con `POST /api/images/uploads`.
- Subir cada archivo con `PUT uploadUrl`.
- Confirmar con `POST /api/images/uploads/complete`.
- Consultar progreso con `GET /api/images/uploads?sessionId=...`.

## Comandos locales utiles

```bash
bun run check
bun run build
bun run deploy
```

No hay suite de tests en este paquete por decision actual del proyecto.
