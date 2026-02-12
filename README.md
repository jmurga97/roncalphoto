# RoncalPhoto

Portfolio web para fotógrafo profesional construido con Astro.

## Stack Técnico

- **Framework**: Astro 5
- **Runtime**: Bun
- **Lenguaje**: TypeScript (modo estricto)
- **Estilos**: Tailwind CSS 4
- **Animaciones**: GSAP
- **Iconos**: @tabler/icons
- **Transiciones**: View Transitions API (ClientRouter)
- **Hosting**: Cloudflare Workers (futuro)

## Estructura del Proyecto

```
roncalphoto/
├── src/
│   ├── components/       # Componentes Astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── [category]/[session].astro
│   ├── lib/
│   │   ├── data.ts       # Datos JSON hardcoded
│   │   ├── types.ts      # Tipos TypeScript
│   │   └── animations.ts # Utilidades GSAP
│   ├── utils/
│   │   └── helpers.ts    # Funciones auxiliares
│   └── styles/
│       └── global.css    # Estilos Tailwind
├── public/
└── package.json
```

## Comandos

Todos los comandos se ejecutan desde la raíz del proyecto:

| Comando             | Acción                                    |
| :------------------ | :---------------------------------------- |
| `bun install`       | Instala dependencias                      |
| `bun dev`           | Inicia servidor de desarrollo en :4321    |
| `bun build`         | Genera sitio de producción en `./dist/`   |
| `bun preview`       | Previsualiza el build localmente          |
| `bun astro check`   | Verifica tipos TypeScript                 |

## Desarrollo

```bash
# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun dev

# Verificar tipos
bun astro check

# Build de producción
bun build
```

## Datos de Ejemplo

El proyecto incluye datos de ejemplo con imágenes de Pexels:

- **Arquitectura**: 2 sesiones (Estructuras Modernas, Patrimonio Urbano)
- **Naturaleza**: 2 sesiones (Paisajes del Norte, Flora Silvestre)
- **Retratos**: Categoría vacía (placeholder)

Cada sesión contiene 5 fotos con metadatos completos (ISO, apertura, velocidad, lente, cámara).

## Fases del Proyecto

- [x] **Fase 1**: Configuración inicial y estructura base
- [x] **Fase 2**: Layout base y Sidebar
- [ ] **Fase 3**: Galería principal y scroll sincronizado
- [ ] **Fase 4**: Información de sesión y metadatos
- [ ] **Fase 5**: Fullscreen y navegación por teclado
- [ ] **Fase 6**: View Transitions y optimización
- [ ] **Fase 7**: Preparación para base de datos

## Componentes

### Sidebar (`src/components/Sidebar.astro`)
- **Desktop**: 25vw fijo a la izquierda, abierto por defecto
- **Mobile**: Fullscreen overlay, cerrado por defecto
- Estado persistente con localStorage
- Animaciones GSAP para apertura/cierre
- Gestión de foco accesible (Escape para cerrar)

### SidebarToggle (`src/components/SidebarToggle.astro`)
- Botón hamburguesa con animación a X
- Siempre visible en la esquina superior izquierda

### CategoryMenu (`src/components/CategoryMenu.astro`)
- Modo navegación: lista completa de categorías y sesiones
- Modo sesión: dropdown compacto con categoría activa

### SessionInfo (`src/components/SessionInfo.astro`)
- Lista de sesiones de la categoría
- Información detallada de la sesión activa (título, descripción HTML)
