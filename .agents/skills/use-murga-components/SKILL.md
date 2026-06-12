---
name: use-murga-components
description: Integrate the `@murga.ing/components` Lit component library into React and TypeScript applications. Use when installing Murga Components, registering custom elements, self-hosting Geist Pixel Line, choosing between direct `mc-*` JSX tags and React wrappers, wiring controlled state and `mc-*` custom events, handling client-only registration in SSR frameworks, applying themes or CSS parts, or troubleshooting Murga component types and runtime behavior.
---

# Use Murga Components

Integrate Murga Components without bypassing its registration, event, accessibility, or styling contracts. Prefer React wrappers for property-rich interactive components and direct custom-element JSX for simple presentation.

## Workflow

1. Inspect the target project's package manager, React version, rendering model, and existing application entrypoint.
2. Inspect the installed `@murga.ing/components/package.json` and type declarations when available. Treat package exports and peer dependencies as version-specific.
3. Install the package with the target project's existing package manager. Do not switch package managers or use the old `@murga/components` name.
4. Install an approved Geist Pixel Line WOFF2 asset into the React application's public assets when the design uses Murga display typography. Inspect package exports first; version 1.0.0 does not export a font file.
5. Register either the complete library once or only the components the application uses.
6. Import `@murga.ing/components/react` in React TypeScript projects that render `mc-*` JSX tags or use wrappers.
7. Choose direct JSX or a React wrapper using the rules below.
8. Keep application state, routing, persistence, and data fetching outside the components.
9. Run the target project's typecheck, lint, build, and relevant tests.

## Register Components

For a client-rendered React application, register once near the application bootstrap:

```tsx
import { registerMurgaComponents } from "@murga.ing/components/register";
import "@murga.ing/components/react";

registerMurgaComponents();
```

Prefer per-component registration when bundle scope or lazy loading matters:

```tsx
import { defineMcButton } from "@murga.ing/components/components/mc-button";
import "@murga.ing/components/react";

defineMcButton();
```

Do not rely on importing the root package to register elements. Registration is intentionally side-effect free and each `defineMc*()` function is idempotent.

For SSR frameworks, execute registration only in a browser/client module because it uses `customElements`. Keep server-rendered modules free of registration calls. Follow the framework's established client-boundary pattern instead of adding a new architecture.

## Choose The React Form

Use a direct `mc-*` tag when props are primitive, children/slots do most of the work, and no typed wrapper callback is needed:

```tsx
export function SaveButton() {
  return <mc-button variant="primary">Save</mc-button>;
}
```

Use an exported React wrapper when the component accepts arrays or objects, exposes custom events, needs a React ref, or participates in controlled state:

```tsx
import { useState } from "react";
import { McTagPicker } from "@murga.ing/components/react";

const options = [
  { id: "editorial", label: "Editorial" },
  { id: "featured", label: "Featured" },
];

export function TagPicker() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <McTagPicker
      options={options}
      selectedIds={selectedIds}
      onMcChange={(event) => setSelectedIds(event.detail.selectedIds)}
    />
  );
}
```

Do not serialize arrays or objects into HTML attributes. Pass them as JavaScript properties through React 19 custom-element support or, preferably, a supplied wrapper.

## Handle State And Events

Treat values such as `value`, `checked`, `selectedId`, `selectedIds`, `open`, `page`, and `theme` as controlled state when the application owns them. Read the next state from `event.detail`, update React state, and pass it back to the component.

Wrapper event props use camel-cased names such as `onMcChange`, `onMcSelect`, and `onMcOpenChange`. Native custom-element JSX event props use the literal event spelling supported by the installed React declarations, for example:

```tsx
<mc-theme-switcher
  theme={theme}
  onmc-theme-change={(event) => setTheme(event.detail.theme)}
/>
```

Do not replace custom events with `onChange` or assume React synthetic-event shapes. Consult [references/react-integration.md](references/react-integration.md) for the current wrappers and event details.

## Preserve Accessibility

- Keep visible labels, `aria-label`, `inputId`, and matching field relationships intact.
- Preserve keyboard interaction and focus behavior supplied by the component.
- Use `disabled`, `required`, `invalid`, and pending/loading props rather than recreating those states around the component.
- Do not attach click handlers to non-interactive wrappers as a substitute for component events.
- Keep meaningful image `alt` text and navigation labels in application data.

## Theme And Style

Set `data-mc-theme="dark"` or `data-mc-theme="light"` on a shared ancestor. The application owns theme state, persistence, and operating-system preference.

```tsx
<main data-mc-theme={theme}>{children}</main>
```

Install an approved Geist Pixel Line font asset when matching Murga's display typography. For a
Vite React application, copy the WOFF2 file into that application's `public/fonts` directory and
declare it in globally imported CSS. Do not assume the component package exports font assets. Read
[references/react-integration.md](references/react-integration.md) for single-app and monorepo
examples.

Load Space Grotesk and Space Mono separately when matching the complete typography system. The
package does not register fonts as an import side effect.

Style component hosts normally. Customize shadow DOM only through inherited CSS custom properties and exposed parts:

```css
.danger-zone mc-button {
  --accent: #ff4d4d;
}

mc-button::part(button) {
  min-inline-size: 8rem;
}
```

Do not target private shadow-DOM class names or copy component internals into the application.

## Verify The Integration

- Confirm registration runs once on the client before interaction.
- Confirm TypeScript sees `mc-*` JSX tags after importing the React entrypoint.
- Confirm wrapper names and event detail shapes against the installed declarations.
- Confirm controlled values update after each custom event.
- Confirm the Geist Pixel Line request returns a WOFF2 response instead of falling back silently.
- Confirm the target project's React version satisfies current peer dependencies.
- Run the existing checks; do not introduce a new test framework unless requested.

For wrapper inventory, event details, SSR examples, and troubleshooting, read [references/react-integration.md](references/react-integration.md).
