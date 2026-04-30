# Dashboard blueprint para `apps/photos-admin`

Este documento define como construir un futuro dashboard administrativo para RoncalPhoto usando `@murga/components` como libreria UI principal. Es una guia de implementacion futura, no una descripcion del estado actual del repo.

El dashboard se plantea como una app separada del monorepo: `apps/photos-admin`. Su objetivo es reutilizar la estructura mental de `apps/photos` y sustituir sus piezas visuales por componentes basados en Lit y wrappers de integracion cuando hagan falta.

## Objetivo

- construir una app administrativa separada para sesiones, fotos y tags;
- reutilizar `@murga/components` como base visual y de interaccion;
- mantener una arquitectura de app consistente con el monorepo actual;
- evitar que la libreria UI absorba responsabilidades de datos o backend.

## Stack y convenciones

La app futura debe mantener las convenciones ya presentes en el repo:

- Bun como runtime y package manager;
- TanStack Router para rutas y shell persistente;
- layout fijo a `100vh`;
- sidebar en desktop y modo overlay en mobile;
- accesibilidad completa por teclado;
- estados `loading`, `empty`, `error` y `success` resueltos inline.

## Lenguaje visual

`apps/photos-admin` debe apoyarse unicamente en el sistema Nothing documentado en `docs/nothing-design`.

### Fuentes

La app debe cargar desde Google Fonts:

- `Doto`;
- `Space Grotesk`;
- `Space Mono`.

Ejemplo de carga en web:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Doto:wght@400..700&family=Space+Grotesk:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap"
/>
```

### Reglas visuales del dashboard

- modo oscuro unico;
- sin theme switching;
- sin sombras, sin skeletons, sin toasts;
- labels y metadata en `Space Mono`;
- `Doto` solo para hero metrics o titulares concretos;
- un solo momento de acento rojo por pantalla;
- feedback inline con copy operativo: `[LOADING]`, `[SAVED]`, `[ERROR: ...]`.

## Patrones heredados de `apps/photos`

El dashboard debe tomar como referencia patrones reales ya montados en `apps/photos`, pero reinterpretados en clave administrativa:

- `MainLayout` como shell persistente con sidebar y `main` flexible;
- navegacion contextual en sidebar, similar al panel editorial actual;
- vista inicial equivalente a `home`, transformada en overview operativo;
- vistas de detalle similares al flujo `session/:slug`, pero orientadas a lectura y edicion;
- paneles secundarios para contexto relacionado, actividad y acciones;
- rail de miniaturas o preview media cuando el contenido de fotos lo necesite.

## Arquitectura de pantallas

La documentacion del dashboard debe organizarse por estas areas:

### Overview

- pantalla de entrada con metricas, accesos rapidos y actividad reciente;
- composicion top-heavy con una metrica o titular dominante;
- bloques secundarios para sesiones, fotos y tags pendientes de accion.

### Sesiones

- listado de sesiones con densidad editorial;
- filtros y navegacion contextual;
- detalle/edicion de una sesion en layout de panel principal + panel auxiliar;
- confirmaciones inline para acciones destructivas o cambios relevantes.

### Fotos

- lista o grid operativa de fotos;
- preview principal con metadata visible;
- rail de miniaturas o tira lateral para navegacion rapida;
- formularios editoriales para copy, orden y metadatos.

### Tags

- listado sobrio de tags;
- asociacion visual con sesiones relacionadas;
- foco en seleccion, navegacion y mantenimiento editorial.

### Formularios y confirmaciones

- fields accesibles con label superior y error inline;
- acciones primarias, secundarias y destructivas con copy corto;
- confirmaciones embebidas o en dialogo segun criticidad;
- sin toasts: el resultado vive junto al formulario o la accion.

### Estados de sistema

- `[LOADING]` o variantes segmentadas para carga;
- empty states secos, tipograficos y sin ilustracion amable;
- errores visibles dentro del flujo;
- confirmaciones breves integradas en contexto.

## Mapeo de patrones de `apps/photos` a `@murga/components`

Este dashboard debe traducir los patrones existentes a piezas de libreria UI:

| Patron en `apps/photos` | Uso futuro en `apps/photos-admin` | Familia UI en `@murga/components` |
| --- | --- | --- |
| Sidebar persistente y overlay mobile | Shell administrativo y navegacion contextual | shell/navigation |
| Cards y listados de sesiones | Overview, listados editoriales y accesos rapidos | data display |
| Header y bloques relacionados del sidebar | Contexto, metadata y relaciones laterales | shell/navigation + data display |
| Gallery detail con foco en media | Preview principal y rail de miniaturas | media surfaces |
| Controles de tema/about/footer | Acciones de sistema y utilidades globales | shell/navigation + feedback |
| Formularios y acciones editoriales | Edicion de sesiones, fotos y tags | inputs/formularios |
| Estados vacios y errores | Respuesta inline en cada pantalla | feedback/estados |

## Responsabilidad entre app y libreria

`@murga/components` debe quedarse en la capa UI. `apps/photos-admin` sera responsable de:

- routing;
- carga y mutacion de datos;
- permisos o autenticacion;
- adaptadores de dominio;
- coordinacion entre vistas y estado de aplicacion.

La libreria debe aportar:

- custom elements;
- wrappers de integracion cuando una app React los necesite;
- tokens y primitives visuales;
- patrones accesibles de interaccion y composicion.

## Propuesta de estructura futura

La futura app puede organizarse asi:

```text
apps/photos-admin/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── app/
    │   ├── layouts/
    │   │   └── main-layout.tsx
    │   ├── routes/
    │   │   ├── __root.tsx
    │   │   ├── _app.tsx
    │   │   ├── _app.index.tsx
    │   │   ├── _app.sessions.tsx
    │   │   ├── _app.sessions.$slug.tsx
    │   │   ├── _app.photos.tsx
    │   │   ├── _app.photos.$id.tsx
    │   │   └── _app.tags.tsx
    │   └── styles/
    │       ├── tokens.css
    │       ├── base.css
    │       └── global.css
    ├── components/
    │   ├── shell/
    │   ├── forms/
    │   ├── feedback/
    │   └── media/
    ├── pages/
    │   ├── overview/
    │   ├── sessions/
    │   ├── photos/
    │   └── tags/
    ├── lib/
    │   ├── api/
    │   └── query/
    └── utils/
```

### Responsabilidades por capa

- `app/layouts`: shell persistente, sidebar, overlays y distribucion general;
- `app/routes`: composicion de rutas y loaders de pantalla;
- `components`: adaptadores finos y piezas especificas de la app cuando la libreria no cubra el caso completo;
- `pages`: composicion por dominio administrativo;
- `lib`: integracion de datos propia de la app;
- `utils`: helpers sin acoplar la UI al backend.

## Criterios de aceptacion para una futura implementacion

- la app vive como workspace separada `apps/photos-admin`;
- la UI se construye con `@murga/components` como base visible;
- el layout respeta `100vh`, sidebar desktop y overlay mobile;
- el sistema visual es dark-only y sigue Nothing design;
- la app no introduce toasts, skeletons ni theme switch;
- la responsabilidad de datos queda en la app, no en la libreria UI.
