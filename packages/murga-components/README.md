# `@murga/components`

`@murga/components` es la libreria UI de RoncalPhoto para Custom Elements basados en Lit. Este README es la fuente canonica para los proximos prompts de implementacion dentro del package.

## Objetivo

- Construir Custom Elements reutilizables y wrappers de React solo cuando hagan falta.
- Centralizar tokens, patrones de interaccion y primitives accesibles.
- Mantener la libreria desacoplada del dominio y del backend.

## No objetivos

- No hacer `fetch`.
- No resolver persistencia ni mutaciones remotas.
- No incluir routing.
- No normalizar datos de `@roncal/shared`.
- No acoplar componentes a `Session`, `Photo` o `Tag`.

## Superficie publica actual

- Entry points: `@murga/components`, `@murga/components/react`
- Registro real hoy: `mc-button`, `mc-input`, `mc-textarea`, `mc-select`, `mc-checkbox`, `mc-badge`, `mc-status-text`, `mc-thumbnail`, `mc-field`, `mc-search-field`, `mc-tag-list`, `mc-tag-picker`, `mc-inline-message`, `mc-confirm-action`, `mc-pagination`, `mc-nav-list`, `mc-thumbnail-rail`, `mc-app-shell`, `mc-sidebar-nav`, `mc-overview-panel`, `mc-resource-table`, `mc-resource-editor`, `mc-media-browser`, `mc-relationship-panel`
- Simbolos estables hoy: `registerMurgaComponents()`, `murgaComponentRegistry`, `reactWrapperEntryPoint`
- Wrappers React implementados hoy: `McSelect`, `McTagList`, `McTagPicker`, `McNavList`, `McThumbnailRail`, `McSidebarNav`, `McOverviewPanel`, `McResourceTable`, `McMediaBrowser`, `McRelationshipPanel`
- Tipos de API tipo `MurgaApi*` o `MurgaCrudEventDetail` ya no forman parte de la superficie publica
- Roadmap pendiente hoy: `mc-icon-button`, `mc-stat-card`, `mc-tag-editor`

```ts
import "@murga/components";
import { registerMurgaComponents } from "@murga/components";

registerMurgaComponents();
```

## Invariantes visuales

- Cargar `Doto`, `Space Grotesk` y `Space Mono` desde Google Fonts antes de renderizar componentes.
- Tomar los valores exactos de `docs/nothing-design/references/tokens.md`.
- Dark-only. No hay theme switching dentro de la libreria.
- UI monocroma. `#D71921` es el unico acento de chrome; los tonos de exito o warning solo se usan para codificar valores de estado.
- Solo tres capas de jerarquia visual: primaria, secundaria y terciaria.
- `Doto` se reserva para display; `Space Grotesk` para UI y copy; `Space Mono` para labels, metadata y estados inline.
- No usar sombras, skeletons, toasts flotantes ni gradientes decorativos.
- El feedback vive inline con copy corto: `[LOADING]`, `[SAVED]`, `[ERROR: ...]`.

## Contrato de implementacion

- Cada componente vive en `src/components/<tag>.ts`.
- Cada componente exporta `TAG_NAME`, la clase del elemento, una funcion `define*()` y un tipo `Args` derivado de la clase con `Pick` y `Partial<Pick>`.
- Cada elemento nuevo debe registrarse en `src/index.ts`, agregarse a `murgaComponentRegistry` y declararse en `HTMLElementTagNameMap`.
- Solo crear wrapper React cuando el componente necesite props JS no triviales o puente de eventos.
- La app consumidora es responsable de mapear `@roncal/shared` a view models UI genericos.

## Reglas de API y accesibilidad

- Los atributos HTML estandar se mantienen en lowercase: `maxlength`, `readonly`, `placeholder`, `autocomplete`, `name`.
- Las props custom usan camelCase.
- Los controles text-like usan `value`.
- Los selectores usan `selectedId` o `selectedIds`.
- Los overlays usan `open`.
- Las props booleanas que gobiernan estilos o estado accesible usan `reflect: true`.
- Los componentes son controlados por defecto; no duplicar estado publico internamente.
- Los elementos interactivos usan controles nativos reales: `button`, `input`, `textarea`, `select`, `dialog` semantico cuando aplique.
- Si el control nativo vive dentro del shadow DOM, la API publica debe reenviar sus atributos ARIA al control nativo.
- Los eventos custom usan prefijo `mc-`, `kebab-case` y siempre exponen el siguiente estado esperado en `detail`.
- No envolver eventos nativos si el evento nativo ya resuelve el caso.
- Los IDs usados en relaciones ARIA deben venir de props documentadas como `inputId`; no hardcodear IDs reutilizables.
- Los overlays deben atrapar foco, restaurarlo al cerrar y limpiar listeners en `disconnectedCallback`.
- Para el shadow DOM usar `@query` o `this.renderRoot.querySelector`; para light DOM usar `this.querySelector`.
- Nunca consultar internals propios con `document.querySelector`.
- Nunca estilizar los internals de otro componente; usar slots, CSS parts y custom properties.
- Preferir slots para contenido composable y props JS para colecciones estructuradas como `items`, `columns`, `rows` o `media`.

## Mapa de APIs actual

| Recurso | Endpoints disponibles hoy | Implicacion para la libreria |
| --- | --- | --- |
| Sessions | `GET /api/sessions`, `GET /api/sessions/{slug}`, `POST /api/sessions`, `PUT /api/sessions/{slug}`, `DELETE /api/sessions/{slug}` | Cubre listados, detalle, formularios de alta/edicion y confirmaciones de borrado. `GET /api/sessions?include=photos` habilita shells editoriales con preview. |
| Photos | `GET /api/photos`, `GET /api/photos/{id}`, `POST /api/photos`, `PUT /api/photos/{id}`, `DELETE /api/photos/{id}` | Cubre tabla/listado paginado, editor de foto, browser de media y confirmaciones de borrado. |
| Tags | `GET /api/tags`, `GET /api/tags/{slug}` | Permite lectura, navegacion, seleccion y relaciones. No existe CRUD de tags, asi que `mc-tag-editor` queda diferido. |

## Contratos UI planeados

Estos contratos son de referencia documental. No se exportan todavia; sirven para guiar la implementacion de props complejas y wrappers React.

```ts
type McStatusTone = "idle" | "loading" | "success" | "error";

interface McOption {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface McNavItem {
  id: string;
  label: string;
  description?: string;
  current?: boolean;
  count?: number;
}

interface McTagItem {
  id: string;
  label: string;
  selected?: boolean;
}

interface McMediaItem {
  id: string;
  src: string;
  thumbnailSrc?: string;
  alt: string;
  caption?: string;
}

interface McStatItem {
  id: string;
  label: string;
  value: string;
  status?: McStatusTone;
}

interface McTableColumn {
  id: string;
  label: string;
  align?: "start" | "center" | "end";
  width?: string;
  sortable?: boolean;
}

interface McTableRow {
  id: string;
  cells: Record<string, string | number>;
  selected?: boolean;
}

interface McInlineStatus {
  tone: McStatusTone;
  label: string;
}
```

## Formato canonico de ficha de componente

Cada componente nuevo documentado aqui debe mantener este orden:

- `tag`
- `tier`
- `status`
- `purpose`
- `backing API`
- `properties`
- `events`
- `slots`
- `css parts`
- `react wrapper`

## Catalogo de componentes

### Atomos

- `mc-button` — `tag: mc-button`; `tier: atom`; `status: implemented`; `purpose: accion primaria, secundaria, ghost o destructiva`; `backing API: none`; `properties: variant, size, type, disabled, pending, ariaLabel`; `events: native click`; `slots: default, icon-start, icon-end`; `css parts: button, label, icon`; `react wrapper: no`.
- `mc-icon-button` — `tag: mc-icon-button`; `tier: atom`; `status: planned`; `purpose: accion o toggle icon-only`; `backing API: none`; `properties: variant, size, disabled, pressed, ariaLabel`; `events: native click`; `slots: default`; `css parts: button, icon`; `react wrapper: no`.
- `mc-input` — `tag: mc-input`; `tier: atom`; `status: implemented`; `purpose: campo de texto, slug o URL`; `backing API: sessions create/update, photos create/update`; `properties: value, inputId, name, type, placeholder, autocomplete, disabled, required, readonly, maxlength, invalid, ariaLabel`; `events: mc-input, mc-change`; `slots: none`; `css parts: input`; `react wrapper: no`.
- `mc-textarea` — `tag: mc-textarea`; `tier: atom`; `status: implemented`; `purpose: descripcion larga`; `backing API: sessions create/update, photos create/update`; `properties: value, inputId, name, rows, placeholder, disabled, required, readonly, maxlength, invalid`; `events: mc-input, mc-change`; `slots: none`; `css parts: textarea`; `react wrapper: no`.
- `mc-select` — `tag: mc-select`; `tier: atom`; `status: implemented`; `purpose: seleccion simple desde McOption[]`; `backing API: filtros y asociaciones de sesiones/tags`; `properties: options, selectedId, inputId, name, placeholder, disabled, open`; `events: mc-change, mc-open-change`; `slots: none`; `css parts: field, trigger, panel, option`; `react wrapper: yes`.
- `mc-checkbox` — `tag: mc-checkbox`; `tier: atom`; `status: implemented`; `purpose: seleccion booleana`; `backing API: seleccion local y tablas`; `properties: checked, name, value, disabled, required, ariaLabel`; `events: mc-change`; `slots: none`; `css parts: input, indicator`; `react wrapper: no`.
- `mc-badge` — `tag: mc-badge`; `tier: atom`; `status: implemented`; `purpose: label corto o categoria`; `backing API: tags y estados visuales`; `properties: tone`; `events: none`; `slots: default`; `css parts: base, label`; `react wrapper: no`.
- `mc-status-text` — `tag: mc-status-text`; `tier: atom`; `status: implemented`; `purpose: feedback inline operacional`; `backing API: carga, guardado y error`; `properties: tone, label, polite`; `events: none`; `slots: none`; `css parts: text`; `react wrapper: no`.
- `mc-thumbnail` — `tag: mc-thumbnail`; `tier: atom`; `status: implemented`; `purpose: preview compacto con estado seleccionado`; `backing API: photos list/detail y sessions include=photos`; `properties: itemId, src, alt, selected, disabled, loading, ratio`; `events: mc-select`; `slots: none`; `css parts: button, image`; `react wrapper: no`.

### Moleculas

- `mc-field` — `tag: mc-field`; `tier: molecule`; `status: implemented`; `purpose: label, hint y error para un control`; `backing API: formularios de sessions, photos y futuras tags`; `properties: inputId, label, hint, error, required, optional, invalid`; `events: none`; `slots: default`; `css parts: label, hint, error, content`; `react wrapper: no`.
- `mc-search-field` — `tag: mc-search-field`; `tier: molecule`; `status: implemented`; `purpose: busqueda o filtro textual`; `backing API: filtros de listas locales o remotas`; `properties: value, inputId, name, placeholder, disabled, pending`; `events: mc-input, mc-change, mc-clear`; `slots: none`; `css parts: root, input, icon, clear-button`; `react wrapper: no`.
- `mc-tag-list` — `tag: mc-tag-list`; `tier: molecule`; `status: implemented`; `purpose: tira densa de tags en solo lectura o seleccion`; `backing API: GET /api/tags y detalle de session`; `properties: items, selectedIds, interactive`; `events: mc-select`; `slots: none`; `css parts: list, item`; `react wrapper: yes`.
- `mc-tag-picker` — `tag: mc-tag-picker`; `tier: molecule`; `status: implemented`; `purpose: seleccion multiple de tags`; `backing API: sessions create/update y futuro tag maintenance`; `properties: options, selectedIds, inputId, disabled, open`; `events: mc-change, mc-open-change`; `slots: none`; `css parts: field, trigger, panel, option`; `react wrapper: yes`.
- `mc-inline-message` — `tag: mc-inline-message`; `tier: molecule`; `status: implemented`; `purpose: bloque inline de exito, info o error`; `backing API: todos los flujos de mutacion`; `properties: tone, title, message`; `events: none`; `slots: none`; `css parts: root, title, body`; `react wrapper: no`.
- `mc-confirm-action` — `tag: mc-confirm-action`; `tier: molecule`; `status: implemented`; `purpose: confirmacion embebida para acciones destructivas`; `backing API: delete session, delete photo, futuro delete tag`; `properties: open, tone, message, confirmLabel, cancelLabel, disabled, pending`; `events: mc-confirm, mc-cancel, mc-open-change`; `slots: none`; `css parts: root, message, actions`; `react wrapper: no`.
- `mc-pagination` — `tag: mc-pagination`; `tier: molecule`; `status: implemented`; `purpose: navegacion paginada`; `backing API: GET /api/photos`; `properties: page, pageSize, total, hasMore, disabled`; `events: mc-page-change`; `slots: none`; `css parts: root, prev-button, next-button, meta`; `react wrapper: no`.
- `mc-nav-list` — `tag: mc-nav-list`; `tier: molecule`; `status: implemented`; `purpose: lista de navegacion o recursos relacionados`; `backing API: GET /api/sessions, GET /api/tags/:slug`; `properties: items, ariaLabel, orientation`; `events: mc-select`; `slots: none`; `css parts: list, item, label, meta`; `react wrapper: yes`.
- `mc-stat-card` — `tag: mc-stat-card`; `tier: molecule`; `status: planned`; `purpose: metrica o resumen editorial`; `backing API: agregados de sessions, photos y tags`; `properties: label, value, status, meta`; `events: none`; `slots: footer`; `css parts: root, label, value, meta, footer`; `react wrapper: no`.
- `mc-thumbnail-rail` — `tag: mc-thumbnail-rail`; `tier: molecule`; `status: implemented`; `purpose: rail horizontal o vertical de seleccion media`; `backing API: sessions include=photos y photo detail`; `properties: items, selectedId, ariaLabel, orientation`; `events: mc-select`; `slots: none`; `css parts: rail, item`; `react wrapper: yes`.

### Organismos

- `mc-app-shell` — `tag: mc-app-shell`; `tier: organism`; `status: implemented`; `purpose: shell fijo a 100vh con sidebar persistente y overlay mobile`; `backing API: none`; `properties: sidebarOpen, mobileOverlay`; `events: mc-sidebar-open-change`; `slots: sidebar, main, header, footer`; `css parts: root, sidebar, overlay, main`; `react wrapper: no`.
- `mc-sidebar-nav` — `tag: mc-sidebar-nav`; `tier: organism`; `status: implemented`; `purpose: panel de navegacion principal y contextual`; `backing API: GET /api/sessions, GET /api/tags, GET /api/tags/:slug`; `properties: ariaLabel, items, secondaryItems, footerItems, open, title, subtitle`; `events: mc-select, mc-open-change`; `slots: header, navigation, footer`; `css parts: root, overlay, panel, header, navigation, footer, section, item`; `react wrapper: yes`.
- `mc-overview-panel` — `tag: mc-overview-panel`; `tier: organism`; `status: implemented`; `purpose: bloque de entrada con metrica dominante y secundarios`; `backing API: agregados derivados de sessions, photos y tags`; `properties: title, description, stats, status`; `events: none`; `slots: actions, content`; `css parts: root, header, stats, body`; `react wrapper: yes`.
- `mc-resource-table` — `tag: mc-resource-table`; `tier: organism`; `status: implemented`; `purpose: listado tabular denso`; `backing API: GET /api/sessions, GET /api/photos, GET /api/tags`; `properties: columns, rows, selectedId, loading, emptyLabel`; `events: mc-row-select, mc-sort`; `slots: empty`; `css parts: root, table, head, body, row, cell`; `react wrapper: yes`.
- `mc-resource-editor` — `tag: mc-resource-editor`; `tier: organism`; `status: implemented`; `purpose: superficie reutilizable de alta y edicion`; `backing API: session CRUD, photo CRUD, futuro tag CRUD`; `properties: resourceTitle, status, dirty, saving, deleting`; `events: mc-save, mc-cancel, mc-delete`; `slots: fields, actions, aside`; `css parts: root, header, body, footer, aside`; `react wrapper: no`.
- `mc-media-browser` — `tag: mc-media-browser`; `tier: organism`; `status: implemented`; `purpose: viewport principal de media con rail opcional`; `backing API: GET /api/sessions/{slug}, GET /api/photos/{id}`; `properties: items, selectedId, showRail, emptyLabel`; `events: mc-select`; `slots: meta`; `css parts: root, viewport, media, rail`; `react wrapper: yes`.
- `mc-relationship-panel` — `tag: mc-relationship-panel`; `tier: organism`; `status: implemented`; `purpose: panel lateral de relaciones entre recursos`; `backing API: GET /api/tags/{slug} y relaciones derivadas de sessions`; `properties: title, items, emptyLabel`; `events: mc-select`; `slots: header, footer`; `css parts: root, header, list, empty`; `react wrapper: yes`.
- `mc-tag-editor` — `tag: mc-tag-editor`; `tier: organism`; `status: deferred`; `purpose: mantenimiento de tags con crear, renombrar y borrar`; `backing API: bloqueado por ausencia de POST /api/tags, PUT /api/tags/{slug}, DELETE /api/tags/{slug}`; `properties: items, selectedIds, draftLabel, open`; `events: mc-change, mc-create, mc-rename, mc-delete, mc-open-change`; `slots: actions`; `css parts: root, list, form, actions`; `react wrapper: yes`.

## Orden de construccion

1. Completado: soporte base y atomos de formulario/accion.
2. Completado: moleculas necesarias para edicion y navegacion.
3. Completado: organismos base del admin.
4. Pendiente: `mc-icon-button` y `mc-stat-card`.
5. Diferido por gap de backend: `mc-tag-editor`.

## Criterios de aceptacion para los proximos prompts

- Diferenciar siempre entre superficie implementada y roadmap.
- No introducir tipos publicos acoplados a `Session`, `Photo` o `Tag`.
- Mantener el mismo esquema de ficha para cada componente nuevo.
- Cubrir con componentes o notas explicitas todos los endpoints actuales de `sessions`, `photos` y `tags`.
- Mantener nombres nuevos con prefijo `Mc`, no `Murga`.
- Marcar como `deferred` cualquier pieza que dependa de endpoints inexistentes.
