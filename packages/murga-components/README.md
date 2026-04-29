# `@murga/components`

## Estructura del package

```text
packages/murga-components/
├── README.md
├── package.json
├── tsconfig.json
└── src/
    ├── components/
    │   └── mc-placeholder.ts
    ├── index.ts
    ├── react.ts
    └── types.ts
```

## Recursos y operaciones actuales

### Sessions

| Método | Ruta | Operación | Input | Respuesta | Errores típicos | Implicación UI |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/api/sessions` | Listado de sesiones | Query opcional `include=photos` | `ApiResponse<ApiSession[]>` | `401`, `403`, `500` | Tabla/lista con variante resumida o hidratada |
| `GET` | `/api/sessions/{slug}` | Detalle de sesión | `slug` en path | `ApiResponse<ApiSession>` | `400`, `401`, `403`, `404`, `500` | Vista de detalle con fotos incluidas |
| `POST` | `/api/sessions` | Crear sesión | `id?`, `slug?`, `title`, `description`, `tagIds[]` | `ApiResponse<ApiSession>` | `400`, `401`, `403`, `500` | Formulario con rich text y selector múltiple de tags |
| `PUT` | `/api/sessions/{slug}` | Actualizar sesión | `slug?`, `title?`, `description?`, `tagIds?` | `ApiResponse<ApiSession>` | `400`, `401`, `403`, `404`, `500` | Formulario con edición parcial |
| `DELETE` | `/api/sessions/{slug}` | Borrar sesión | `slug` en path | `ApiResponse<{ deleted: true }>` | `400`, `401`, `403`, `404`, `500` | Confirmación fuerte por borrado en cascada |

### Photos

| Método | Ruta | Operación | Input | Respuesta | Errores típicos | Implicación UI |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/api/photos` | Listado paginado de fotos | Query `page`, `pageSize` | `PaginatedResponse<ApiPhoto>` | `400`, `401`, `403`, `500` | Grid/lista con paginador y estado vacío |
| `GET` | `/api/photos/{id}` | Detalle de foto | `id` en path | `ApiResponse<ApiPhoto>` | `400`, `401`, `403`, `404`, `500` | Preview detallada con metadata |
| `POST` | `/api/photos` | Crear foto | `id?`, `sessionId`, `url`, `miniature`, `alt`, `about`, `sortOrder?`, `metadata?` | `ApiResponse<ApiPhoto>` | `400`, `401`, `403`, `500` | Formulario con URLs y bloque de metadata |
| `PUT` | `/api/photos/{id}` | Actualizar foto | Cualquier campo editable opcional | `ApiResponse<ApiPhoto>` | `400`, `401`, `403`, `404`, `500` | Formulario con patch parcial |
| `DELETE` | `/api/photos/{id}` | Borrar foto | `id` en path | `ApiResponse<{ deleted: true }>` | `400`, `401`, `403`, `404`, `500` | Acción destructiva con confirmación |

### Tags

| Método | Ruta | Operación | Input | Respuesta | Errores típicos | Implicación UI |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/api/tags` | Listado de tags | Sin body | `ApiResponse<Tag[]>` | `401`, `403`, `500` | Fuente de opciones para filtros y selección |
| `GET` | `/api/tags/{slug}` | Detalle de tag + sesiones | `slug` en path | `ApiResponse<ApiTagWithSessions>` | `400`, `401`, `403`, `404`, `500` | Vista maestra para navegación temática |

## Contratos por recurso

### `ApiSession`

```ts
interface ApiSession {
  id: string;
  slug: string;
  title: string;
  description: string;
  createdAt: string;
  tags: Tag[];
  photos?: ApiPhoto[];
}
```

Notas de UI:

- `description` requiere un editor o una entrada compatible con HTML string.
- `photos` es opcional en el listado, pero obligatoria en la práctica para el detalle.
- `tagIds` no forma parte de la respuesta; solo del payload de escritura.

### `ApiPhoto`

```ts
interface ApiPhoto {
  id: string;
  sessionId: string;
  url: string;
  miniature: string;
  alt: string;
  about: string;
  sortOrder: number;
  metadata: {
    iso: number;
    aperture: string;
    shutterSpeed: string;
    lens: string;
    camera: string;
  };
}
```

Notas de UI:

- `metadata` está normalizada hacia valores no nullables en respuestas.
- En escritura, `metadata` puede ser parcial.
- `sortOrder` necesita control numérico y quizá affordance de reordenación en una fase futura.

### `ApiTagWithSessions`

```ts
interface ApiTagWithSessions {
  tag: Tag;
  sessions: ApiSession[];
}
```

Notas de UI:

- Este recurso alimenta exploración, filtrado y selección.
- No exige edición directa de tags en la versión actual del sistema.

## Catálogo de componentes atómicos propuesto

La librería debe separar átomos de UI, átomos headless y piezas híbridas que ya entiendan el shape de la API.

### Componentes conectados a API

| Custom element | Wrapper React | Tipo | Propósito | Props/attributes clave | Eventos | Endpoints relacionados |
| --- | --- | --- | --- | --- | --- | --- |
| `mc-api-provider` | `McApiProvider` | Headless | Centraliza `baseUrl`, `apiKey`, headers y fetcher | `baseUrl`, `apiKey`, `headers` | `mc-change` | Todos |
| `mc-collection-view` | `McCollectionView` | Híbrido | Ejecuta listados `GET` y maneja loading, error y empty | `resource`, `query`, `loading`, `emptyMessage` | `mc-success`, `mc-error`, `mc-page-change` | `GET /sessions`, `GET /photos`, `GET /tags` |
| `mc-record-view` | `McRecordView` | Híbrido | Ejecuta detalle `GET` por identificador | `resource`, `params`, `loading` | `mc-success`, `mc-error` | `GET /sessions/{slug}`, `GET /photos/{id}`, `GET /tags/{slug}` |
| `mc-form-submit` | `McFormSubmit` | Headless | Orquesta `POST` y `PUT`, serialización y ciclo de submit | `resource`, `method`, `params`, `value`, `disabled` | `mc-submit`, `mc-success`, `mc-error` | Create/update de sessions y photos |
| `mc-delete-action` | `McDeleteAction` | Híbrido | Ejecuta `DELETE` con confirmación integrada o delegada | `resource`, `params`, `confirm`, `disabled` | `mc-delete`, `mc-success`, `mc-error` | Delete de sessions y photos |
| `mc-tag-picker` | `McTagPicker` | Híbrido | Carga tags y expone selección múltiple de `tagIds` | `value`, `required`, `disabled` | `mc-change`, `mc-error` | `GET /tags` |

### Átomos de flujo y feedback

| Custom element | Wrapper React | Tipo | Propósito | Props/attributes clave | Eventos | Endpoints relacionados |
| --- | --- | --- | --- | --- | --- | --- |
| `mc-pagination` | `McPagination` | Visual | Controla `page`, `pageSize`, `hasMore`, `total` | `page`, `pageSize`, `total`, `hasMore` | `mc-page-change` | `GET /photos` |
| `mc-status-message` | `McStatusMessage` | Visual | Muestra éxito, error o info | `status`, `message` | `mc-change` | Todos |
| `mc-spinner` | `McSpinner` | Visual | Estado de carga reusable | `label` | Ninguno | Todos |
| `mc-empty-state` | `McEmptyState` | Visual | Estado vacío reusable | `title`, `description` | Ninguno | Todos |
| `mc-confirm-dialog` | `McConfirmDialog` | Visual | Confirmación accesible para acciones destructivas | `open`, `title`, `description`, `confirmText` | `mc-submit`, `mc-change` | Deletes |
| `mc-button` | `McButton` | Visual | Botón base para acción primaria, secundaria o destructiva | `variant`, `disabled`, `loading`, `type` | `mc-click` o evento nativo `click` | Todos |

### Átomos de formularios

| Custom element | Wrapper React | Tipo | Propósito | Props/attributes clave | Eventos | Endpoints relacionados |
| --- | --- | --- | --- | --- | --- | --- |
| `mc-field` | `McField` | Visual | Shell accesible con label, help text y error | `label`, `hint`, `error`, `required` | `mc-change` | Todos los formularios |
| `mc-text-input` | `McTextInput` | Visual | Texto corto para `title`, `alt`, `lens`, `camera` | `name`, `value`, `placeholder`, `required` | `mc-change` | Create/update sessions y photos |
| `mc-slug-input` | `McSlugInput` | Híbrido | Entrada para `slug` con modo manual o derivado | `value`, `sourceValue`, `autoGenerate` | `mc-change` | Create/update sessions |
| `mc-textarea` | `McTextarea` | Visual | Texto largo plano para `about` | `name`, `value`, `rows`, `required` | `mc-change` | Create/update photos |
| `mc-rich-text-input` | `McRichTextInput` | Híbrido | Entrada de HTML string para `description` | `value`, `toolbar`, `required` | `mc-change` | Create/update sessions |
| `mc-url-input` | `McUrlInput` | Visual | URLs para `url` y `miniature` | `name`, `value`, `required` | `mc-change` | Create/update photos |
| `mc-number-input` | `McNumberInput` | Visual | Entrada numérica para `iso`, `sortOrder`, `page`, `pageSize` | `name`, `value`, `min`, `max`, `step` | `mc-change` | Photos y paginación |
| `mc-multi-select` | `McMultiSelect` | Visual | Selección múltiple genérica para ids o filtros | `value`, `options`, `required` | `mc-change` | Sessions, tags |
| `mc-thumbnail` | `McThumbnail` | Visual | Preview de miniatura con `alt` | `src`, `alt`, `aspectRatio` | Ninguno | Photos |
| `mc-photo-metadata-fields` | `McPhotoMetadataFields` | Híbrido | Agrupa inputs de `iso`, `aperture`, `shutterSpeed`, `lens`, `camera` | `value`, `disabled` | `mc-change` | Create/update photos |

## Cómo se componen los CRUD con estos átomos

### CRUD de sesiones

- Listado básico:
  - `mc-api-provider`
  - `mc-collection-view`
  - `mc-status-message`
  - `mc-spinner`
  - `mc-empty-state`
- Alta y edición:
  - `mc-form-submit`
  - `mc-field`
  - `mc-text-input`
  - `mc-slug-input`
  - `mc-rich-text-input`
  - `mc-tag-picker`
  - `mc-button`
  - `mc-status-message`
- Borrado:
  - `mc-delete-action`
  - `mc-confirm-dialog`
  - `mc-button`

### CRUD de fotos

- Listado y navegación:
  - `mc-collection-view`
  - `mc-pagination`
  - `mc-thumbnail`
  - `mc-spinner`
  - `mc-empty-state`
- Alta y edición:
  - `mc-form-submit`
  - `mc-text-input`
  - `mc-url-input`
  - `mc-textarea`
  - `mc-number-input`
  - `mc-photo-metadata-fields`
  - `mc-button`
  - `mc-status-message`
- Borrado:
  - `mc-delete-action`
  - `mc-confirm-dialog`

### Lectura y selección de tags

- `mc-collection-view` para listados de tags
- `mc-record-view` para detalle de tag con sesiones
- `mc-tag-picker` para `tagIds` en formularios de sesión
- `mc-multi-select` si se quisiera una variante desacoplada de la carga remota

## API pública propuesta para `@murga/components`

### Export principal

El entry point principal debe terminar exponiendo:

- registro de custom elements;
- componentes Lit;
- tipos compartidos de la librería;
- wrappers React listos para consumo directo.

Objetivo de uso:

```ts
import "@murga/components";
import { registerMurgaComponents } from "@murga/components";
import { McCollectionView } from "@murga/components/react";
```

En esta v1:

- `@murga/components` ya registra un placeholder base;
- `@murga/components/react` queda reservado como entry point estable;
- los wrappers React quedan definidos a nivel de contrato, no de implementación final.

### Convención React

- Cada custom element tendrá espejo en PascalCase:
  - `mc-api-provider` -> `McApiProvider`
  - `mc-collection-view` -> `McCollectionView`
  - `mc-tag-picker` -> `McTagPicker`
- Los eventos DOM se mapearán a props tipo callback:
  - `mc-success` -> `onSuccess`
  - `mc-error` -> `onError`
  - `mc-change` -> `onChange`
  - `mc-submit` -> `onSubmit`
  - `mc-page-change` -> `onPageChange`
- Los wrappers deberán encargarse de:
  - registrar listeners;
  - transformar `CustomEvent.detail` a argumentos ergonómicos;
  - evitar que el consumidor de React haga puente manual con `addEventListener`.

### Convención de configuración

Props/attributes transversales que deben repetirse de forma consistente:

- `baseUrl`
- `apiKey`
- `resource`
- `method`
- `params`
- `query`
- `value`
- `disabled`
- `loading`
- `required`

Reglas esperadas:

- `resource` representa una ruta relativa tipo `/sessions` o `/photos/{id}`.
- `params` rellena placeholders de ruta.
- `query` serializa querystring.
- `value` representa el payload o el estado del input, según el componente.
- `baseUrl` y `apiKey` pueden venir del provider o sobrescribirse localmente.

### Convención de eventos

Eventos de contrato recomendados:

- `mc-change`
- `mc-submit`
- `mc-success`
- `mc-error`
- `mc-delete`
- `mc-page-change`

Payload recomendado para componentes conectados:

```ts
interface MurgaCrudEventDetail<TResponse = unknown> {
  resource: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  params?: Record<string, string | number>;
  query?: Record<string, string | number | boolean | undefined>;
  request?: unknown;
  response?: TResponse;
  error?: {
    success: false;
    error: string;
    stack?: string;
  };
}
```

## Qué componentes hablan con la API y cuáles no

### Conectados directamente a API

- `mc-api-provider`
- `mc-collection-view`
- `mc-record-view`
- `mc-form-submit`
- `mc-delete-action`
- `mc-tag-picker`

Todos ellos dependen del shape estándar actual:

- éxito simple `{ success: true, data }`
- éxito paginado `{ success: true, data, pagination }`
- error `{ success: false, error, stack? }`

### Solo UI

- `mc-pagination`
- `mc-status-message`
- `mc-spinner`
- `mc-empty-state`
- `mc-field`
- `mc-text-input`
- `mc-slug-input`
- `mc-textarea`
- `mc-rich-text-input`
- `mc-url-input`
- `mc-number-input`
- `mc-multi-select`
- `mc-thumbnail`
- `mc-button`
- `mc-confirm-dialog`

### Híbridos

- `mc-photo-metadata-fields`
  - puede comportarse como puro agrupador visual o como serializador parcial de metadata.

## Criterios para la futura implementación de componentes

- Deben ser accesibles por teclado.
- Deben funcionar sin depender del sistema visual de `apps/photos`.
- Deben tolerar composición en React 19.
- Deben asumir fetch basado en `X-API-Key`.
- Deben respetar el carácter non-nullable de los tipos compartidos.
- Deben soportar estados `loading`, `error`, `empty` y `success` sin código adicional del consumidor.

## Scaffold actual

La v1 deja estas piezas mínimas:

- `src/components/mc-placeholder.ts`
  - custom element Lit registrado como `mc-placeholder`
- `src/types.ts`
  - tipos base para envelopes, configuración y eventos
- `src/index.ts`
  - registro y exports principales
- `src/react.ts`
  - entry point reservado para wrappers React

## Próximo paso natural

La siguiente iteración puede empezar por los componentes con mayor retorno funcional:

1. `mc-api-provider`
2. `mc-collection-view`
3. `mc-form-submit`
4. `mc-tag-picker`
5. `mc-photo-metadata-fields`

Con esos cinco ya se puede empezar a montar formularios reales de sesiones y fotos encima del CRUD actual.
