# agents.md - RoncalPhoto Portfolio

```markdown
# RoncalPhoto - Portfolio de Fotografía Profesional

## Contexto del Proyecto

Monorepo para portfolio web de fotógrafo profesional. Frontend con Astro desplegado en Cloudflare Pages, API con Hono desplegada en Cloudflare Workers con D1. Paquete de tipos compartido entre ambos. La aplicación presenta sesiones fotográficas organizadas por categorías con énfasis en una experiencia visual limpia y fluida, donde las fotografías son el elemento protagonista.

---

## Stack Técnico

- **Monorepo**: Turborepo + Bun workspaces
- **Frontend** (`apps/web`): Astro 5, React 19, Tailwind CSS 4, GSAP, View Transitions API
- **API** (`apps/api`): Hono, Cloudflare Workers, D1
- **Shared** (`packages/shared`): TypeScript domain types (raw source, no build step)
- **Linting/Formatting**: Biome (no ESLint/Prettier)
- **Runtime**: Bun
- **Lenguaje**: TypeScript (modo estricto)
- **Hosting**: Cloudflare (Pages para web, Workers para API)
- **Base de datos**: Cloudflare D1
- **Imágenes placeholder**: Pexels

---

## Convenciones Generales

### Package Manager
- **Exclusivamente Bun**. No usar npm ni yarn bajo ningún concepto.

### TypeScript
- Modo estricto activado desde el inicio
- Evitar `any` y `unknown`
- Preferir inferencia de tipos siempre que sea posible
- Si los tipos no están claros, parar y aclarar antes de continuar

### Estilos
- Tailwind CSS es la única solución de estilos
- No duplicar clases; extraer componentes cuando sea necesario
- Priorizar legibilidad sobre micro-optimizaciones visuales

### Accesibilidad
- HTML semántico obligatorio
- Roles ARIA cuando aplique
- Gestión de foco en navegación por teclado
- Navegación completa por teclado (flechas, Escape, Enter)

### Sintaxis
- Preferir ESM y sintaxis moderna del navegador
- Componentes pequeños con una sola responsabilidad
- Composición sobre configuraciones complejas
- Evitar abstracciones prematuras

---

## Estructura de Archivos

```
roncalphoto/
├── apps/
│   ├── web/                    # @roncal/web - Astro frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Sidebar.astro
│   │   │   │   ├── SidebarToggle.astro
│   │   │   │   ├── CategoryMenu.astro
│   │   │   │   ├── SessionInfo.astro
│   │   │   │   └── react/gallery/  # React gallery components
│   │   │   ├── layouts/
│   │   │   │   └── BaseLayout.astro
│   │   │   ├── pages/
│   │   │   │   ├── index.astro
│   │   │   │   └── [category]/[session].astro
│   │   │   ├── lib/
│   │   │   │   ├── api.ts          # API client (build-time fetch)
│   │   │   │   └── animations.ts   # GSAP utilities
│   │   │   ├── utils/
│   │   │   │   └── helpers.ts
│   │   │   └── styles/
│   │   │       └── global.css
│   │   ├── public/
│   │   ├── astro.config.mjs
│   │   └── wrangler.toml
│   └── api/                    # @roncal/api - Hono REST API
│       ├── src/
│       │   ├── db/
│       │   │   └── queries.ts  # D1 database queries
│       │   ├── middleware/
│       │   │   ├── auth.ts     # API key authentication
│       │   │   └── cors.ts     # CORS middleware
│       │   ├── routes/
│       │   │   ├── categories.ts
│       │   │   ├── sessions.ts
│       │   │   └── photos.ts
│       │   ├── types/
│       │   │   └── index.ts    # DB rows, DTOs, Env (imports shared types)
│       │   └── index.ts        # Hono app entry
│       ├── migrations/         # D1 SQL migrations
│       └── wrangler.json
├── packages/
│   └── shared/                 # @roncal/shared - Domain types
│       └── src/
│           ├── types.ts        # PhotoMetadata, Photo, Session, Category, etc.
│           └── index.ts        # Barrel export
├── package.json                # Root workspace config
├── turbo.json                  # Turborepo pipeline
├── tsconfig.json               # Base TypeScript config
├── biome.json                  # Biome linter/formatter
└── .env.example
```

---

## Modelo de Datos

### Tipos TypeScript

```typescript
// packages/shared/src/types.ts - Canonical domain types

export interface PhotoMetadata {
  iso: number;
  aperture: string; // ej: "f/2.8"
  shutterSpeed: string; // ej: "1/250"
  lens: string; // ej: "24-70mm f/2.8"
  camera: string; // ej: "Canon EOS R5"
}

export interface PhotoSummary {
  id: string;
  miniature: string; // Thumbnail URL (R2)
  alt: string;
}

export interface Photo extends PhotoSummary {
  url: string; // Full-size image URL (R2)
  about: string; // Texto adicional relacionado con la foto
  metadata: PhotoMetadata;
}

export interface SessionSummary {
  id: string;
  title: string;
  description: string; // Texto enriquecido (HTML)
  category: string;
  photoCount: number;
  coverPhoto: PhotoSummary;
}

export interface Session {
  id: string;
  title: string;
  description: string; // Texto enriquecido (HTML)
  category: string;
  photos: Photo[];
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  sessionCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sessions: Session[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}
```

**Convención**: Los tipos compartidos usan campos non-nullable. La API transforma nulls de D1 a valores por defecto.

### Estructura JSON Inicial

```typescript
// src/lib/data.ts

export const categories: Category[] = [
  {
    id: "1",
    name: "Arquitectura",
    slug: "arquitectura",
    sessions: [
      {
        id: "arch-01",
        title: "Estructuras Modernas",
        description: "<p>Exploración de...</p>",
        category: "arquitectura",
        photos: [
          {
            id: "photo-1",
            url: "https://images.pexels.com/...",
            miniature: "https://images.pexels.com/...",
            alt: "Edificio moderno al atardecer",
            about: "Una vista impresionante de un edificio moderno capturado al atardecer.",
            metadata: {
              iso: 100,
              aperture: "f/8",
              shutterSpeed: "1/125",
              lens: "24-70mm f/2.8",
              camera: "Canon EOS R5"
            }
          }
          // ... más fotos
        ]
      }
      // ... más sesiones
    ]
  },
  {
    id: "2",
    name: "Series",
    slug: "series",
    sessions: []
  },
  {
    id: "3",
    name: "Retratos",
    slug: "retratos",
    sessions: []
  }
];
```

---

## Especificaciones UI/UX

### Layout y Proporciones

- **Viewport**: 100vh fijo (sin scroll vertical en la página)
- **Sidebar**: 25% del ancho en desktop (izquierda)
- **Galería**: 75% del ancho en desktop (derecha)
- **Distribución de galería**:
  - 85% superior: Foto principal
  - 15% inferior: Carrusel de miniaturas

### Sidebar

#### Desktop
- **Estado por defecto**: Abierto
- **Posición**: Izquierda, fija
- **Ancho**: 25vw
- **Comportamiento**: 
  - Toggle mediante botón
  - Recuerda estado (abierto/cerrado) al cambiar de categoría (usar `localStorage` o estado global)
- **Contenido**:
  - **Sin sesión seleccionada**: Muestra menú de categorías
  - **Con sesión seleccionada**: 
    - Menú de categorías oculto en desplegable
    - Espacio principal para información de sesión (título, descripción HTML, metadatos)
    - Overflow-y si el contenido excede altura disponible

#### Mobile
- **Estado por defecto**: Cerrado
- **Comportamiento**: Al abrir, ocupa toda la pantalla (100vw × 100vh)
- **Posición**: Capa por encima de la galería (z-index alto)

#### Animaciones (GSAP)
- Animación básica de elementos tipográficos al aparecer
- Transición suave de apertura/cierre del sidebar

### Galería Principal

#### Foto Principal (85% superior)
- **Comportamiento de scroll**:
  - El scroll vertical del usuario cambia la foto principal
  - La foto activa debe reflejarse visualmente en el carrusel inferior
- **Animaciones GSAP**:
  - Loading: animación de carga mientras se descarga la imagen
  - Al completar carga: fade + blur (desenfoque → enfoque)
- **Elemento**: `<img>` nativo (no componente de Astro)
- **Modo pantalla completa**:
  - Click en foto principal → fullscreen nativo
  - Navegación con teclado:
    - `←` / `→`: Foto anterior/siguiente
    - `Esc`: Salir de fullscreen

#### Carrusel Inferior (15% inferior)

**Desktop**:
- Scroll horizontal con snap
- Miniaturas de todas las fotos de la sesión
- Lazy loading activado
- La foto activa debe estar centrada y visualmente destacada

**Mobile**:
- Scroll vertical con snap (reemplaza el horizontal)
- Mismo comportamiento de lazy loading

### Navegación por Teclado

- `←` / `→`: Navegar entre fotos (galería y fullscreen)
- `Esc`: Cerrar sidebar (mobile) o salir de fullscreen
- `Tab`: Navegación estándar por elementos interactivos

### Transiciones entre Páginas

- Usar **View Transitions API** de Astro para cambios entre categorías/sesiones
- Transiciones suaves y coherentes con la estética limpia del sitio

---

## Animaciones (GSAP)

### Elementos a Animar

1. **Sidebar**:
   - Apertura/cierre con easing suave
   - Aparición de texto con stagger

2. **Foto Principal**:
   - Loading state (skeleton, spinner, o placeholder)
   - Fade + blur al cargar: 
     ```
     opacity: 0 → 1
     filter: blur(20px) → blur(0px)
     ```

3. **Tipografía**:
   - Fade-in básico para títulos y descripciones
   - Stagger en listas de metadatos

### Librería GSAP
- Instalar solo el core de GSAP (no plugins innecesarios)
- Utilidades compartidas en `apps/web/src/lib/animations.ts`

---

## Testing y Calidad

### Comandos

```bash
# Ejecutar tests
bun test

# Ejecutar Vitest específico
bun vitest run -t "<nombre del test>"

# Lint y formato (Biome)
bun run lint
bun run lint:fix

# TypeScript check (todos los paquetes)
bun run check

# Build (todos los paquetes)
bun run build

# Dev (todos los paquetes)
bun run dev

# Dev (solo web o api)
bunx turbo dev --filter=@roncal/web
bunx turbo dev --filter=@roncal/api
```

### Reglas
- No se acepta código con errores de tipos, lint o tests fallidos
- Añadir o actualizar tests cuando se cambie comportamiento (aunque no se pida explícitamente)
- Validar cambios en pequeño antes de escalar al proyecto completo

### Performance
- No adivinar rendimiento: **medir**
- Si algo parece lento, añadir instrumentación antes de optimizar
- Revisar tamaño de bundle y tiempos de carga con herramientas de Cloudflare

---

## Roadmap de Fases

### FASE 1: Configuración inicial y estructura base
**Objetivo**: Proyecto Astro funcional con TypeScript, Tailwind, GSAP y estructura de carpetas.

**Tareas**:
1. Crear proyecto: `bun create astro@latest roncalphoto`
2. Configurar TypeScript en modo estricto
3. Añadir Tailwind CSS (integración oficial de Astro)
4. Configurar Tailwind 4 con `global.css`
5. Instalar GSAP: `bun add gsap`
6. Instalar Tabler Icons: `bun add @tabler/icons-react` (o versión compatible)
7. Crear estructura de carpetas según especificación
8. Definir tipos en `src/lib/types.ts`
9. Crear datos JSON hardcoded en `src/lib/data.ts` con al menos 2 categorías y 2 sesiones con 5 fotos cada una (Pexels)
10. Configurar View Transitions en Astro

**Entregables**:
- Proyecto ejecutándose con `bun dev`
- Sin errores de tipos o lint
- README actualizado con comandos y stack

---

### FASE 2: Layout base y Sidebar
**Objetivo**: Implementar layout de 100vh con sidebar funcional.

**Tareas**:
1. Crear `BaseLayout.astro` con estructura 100vh
2. Implementar `Sidebar.astro`:
   - 25vw en desktop, fullscreen en mobile
   - Estado persistente (localStorage)
   - Abierto por defecto (desktop), cerrado (mobile)
3. Crear `SidebarToggle.astro` (botón hamburguesa con icono de Tabler)
4. Implementar `CategoryMenu.astro` (lista de categorías)
5. Animación GSAP para apertura/cierre del sidebar
6. Responsive: breakpoint mobile (~768px)
7. Gestión de foco al abrir/cerrar sidebar

**Entregables**:
- Sidebar funcional en desktop y mobile
- Animación suave con GSAP
- Estado recordado entre navegaciones

---

### FASE 3: Galería principal y scroll sincronizado
**Objetivo**: Foto principal controlada por scroll vertical con carrusel inferior.

**Tareas**:
1. Crear `MainGallery.astro` (componente contenedor 75vw)
2. Implementar lógica de scroll vertical → cambio de foto principal
3. Crear `PhotoCarousel.astro`:
   - Desktop: scroll horizontal con snap
   - Mobile: scroll vertical con snap
   - Lazy loading en miniaturas
4. Sincronización: foto activa destacada en carrusel
5. Animación GSAP de carga (loading + fade/blur)
6. Usar `<img>` nativo con atributo `loading="lazy"` en carrusel

**Entregables**:
- Galería funcional con scroll sincronizado
- Carrusel responsive con lazy loading
- Animaciones de carga implementadas

---

### FASE 4: Información de sesión y metadatos
**Objetivo**: Mostrar datos de sesión en sidebar y metadatos de fotos.

**Tareas**:
1. Crear `SessionInfo.astro`:
   - Renderizar HTML enriquecido (descripción)
   - Mostrar título de sesión
   - Overflow-y si excede altura
2. Crear `PhotoMetadata.astro` (mostrar ISO, apertura, velocidad, lente, cámara)
3. Implementar lógica de toggle: menú de categorías ↔ info de sesión
4. Animación GSAP para aparición de texto (stagger)
5. Asegurar accesibilidad: roles ARIA, headings semánticos

**Entregables**:
- Sidebar muestra info completa de sesión
- Metadatos visibles y bien formateados
- Animaciones de texto funcionales

---

### FASE 5: Fullscreen y navegación por teclado
**Objetivo**: Modo pantalla completa nativo con navegación completa por teclado.

**Tareas**:
1. Crear `FullscreenViewer.astro` o implementar lógica inline
2. Click en foto principal → `element.requestFullscreen()`
3. Navegación por teclado:
   - `←` / `→`: Cambiar foto
   - `Esc`: Salir (listener de `fullscreenchange`)
4. Indicador visual de foto activa en fullscreen
5. Asegurar funcionalidad en galería normal y fullscreen
6. Testing en múltiples navegadores

**Entregables**:
- Fullscreen funcional en todos los navegadores modernos
- Navegación por teclado completa
- Sin errores de accesibilidad

---

### FASE 6: View Transitions y optimización
**Objetivo**: Transiciones fluidas entre páginas y optimización para Cloudflare.

**Tareas**:
1. Configurar View Transitions en rutas dinámicas (`[category]/[session].astro`)
2. Personalizar transiciones para mantener coherencia visual
3. Optimizar imágenes:
   - Formatos modernos (WebP, AVIF) para Pexels
   - Atributos `width` y `height` para evitar CLS
4. Configurar build para Cloudflare Workers:
   - Añadir adaptador: `bun add @astrojs/cloudflare`
   - Configurar `astro.config.mjs`
5. Testing de performance (Lighthouse, WebPageTest)
6. Lazy loading de GSAP en componentes necesarios

**Entregables**:
- View Transitions funcionando entre páginas
- Build optimizado para Cloudflare
- Lighthouse score > 90 en todas las métricas

---

### FASE 7: Preparación para base de datos (futuro)
**Objetivo**: Abstraer capa de datos para migración futura a D1 + R2.

**Tareas**:
1. Crear capa de abstracción en `src/lib/data.ts`:
   ```typescript
   export async function getCategories(): Promise<Category[]>
   export async function getSession(categorySlug: string, sessionId: string): Promise<Session>
   ```
2. Documentar estructura de tablas D1 en README
3. Documentar estructura de archivos R2 (organización de URLs)
4. Crear archivo `MIGRATION.md` con pasos para migración
5. (Opcional) Mock de llamadas asíncronas para simular latencia

**Entregables**:
- Capa de datos abstraída
- Documentación de migración completa
- Proyecto preparado para swap de JSON → D1/R2

---

## Decisiones Arquitectónicas

### Por qué Astro
- Rendimiento excepcional con generación estática
- Compatibilidad nativa con Cloudflare Workers
- View Transitions API integrada
- TypeScript de primera clase

### Por qué NO usar librerías de galería
- Control total sobre UX y animaciones GSAP
- Menor bundle size
- Aprendizaje y customización total
- Mejor integración con View Transitions

### Estado del Sidebar
- `localStorage` para persistencia entre navegaciones
- Alternativa: state management ligero (nanostores) si crece complejidad

### Scroll Sincronizado
- Usar `IntersectionObserver` para detectar foto visible
- Scroll-snap CSS nativo para UX suave
- GSAP solo para animaciones visuales, no para scroll-hijacking

### Lazy Loading
- Nativo del navegador (`loading="lazy"`)
- Futuro: imágenes thumbnail separadas desde R2

---

## Comportamiento Esperado del Agente

### Tareas Simples (Ejecutar Directamente)
- Crear componentes nuevos según especificación clara
- Añadir estilos Tailwind
- Implementar animaciones GSAP descritas
- Corregir errores de tipos o lint

### Tareas Complejas (Confirmar Antes de Actuar)
- Cambios de arquitectura (ej: cambiar sistema de estado)
- Refactors grandes (ej: reestructurar carpetas)
- Decisiones de rendimiento (ej: code-splitting)
- Nuevas dependencias no especificadas

### Reglas de Comunicación
- **No asumir requisitos implícitos**: Si falta información, preguntar.
- **Explicar cambios**: En PRs, documentar qué, por qué y cómo se verificó.
- **Validar en pequeño**: No escalar cambios sin probar en scope reducido.
- **Documentar restricciones**: Si se añade una regla nueva ("nunca X", "siempre Y"), actualizar este archivo.

### Flujo de Trabajo
1. Leer petición completa
2. Si no está clara: hacer preguntas concretas
3. Si está clara: ejecutar y verificar (tipos, lint, tests)
4. Documentar cambios en commit/PR
5. Actualizar README o `agents.md` si aplica

---

## Commits y Pull Requests

### Formato de Título
```
[roncalphoto] Descripción clara y concisa
```

### Contenido del PR
- **Qué ha cambiado**: Lista de cambios técnicos
- **Por qué**: Justificación del cambio
- **Cómo se ha verificado**: Tests ejecutados, validaciones manuales

### Buenas Prácticas
- PRs pequeños y enfocados
- Un concepto por PR (no mezclar features con refactors)
- Incluir capturas de pantalla si hay cambios visuales
- Referenciar issues si existen

---

## Notas Finales

- **Imágenes de Pexels**: Usar API gratuita o URLs directas. Documentar atribución si es necesaria.
- **Cloudflare**: Frontend en Cloudflare Pages (output estático con adaptador), API en Workers. Configuración en `apps/web/wrangler.toml` y `apps/api/wrangler.json`.
- **D1/R2**: API ya usa D1 para datos. Mantener estructura de tipos alineada entre frontend y API.
- **@roncal/shared**: Raw TypeScript source (no build step). Ambos bundlers (Vite y Wrangler) consumen `.ts` directamente.
- **Accesibilidad**: No es opcional. Validar con herramientas (axe DevTools, Lighthouse).
- **Performance**: Medir antes de optimizar. Usar `bun build` y analizar bundle.

---

**Documento vivo**: Este archivo debe actualizarse cuando surjan nuevas convenciones, restricciones o decisiones arquitectónicas durante el desarrollo.
```
