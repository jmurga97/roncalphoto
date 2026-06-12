# React Integration Reference

Use this reference after inspecting the installed package version. The inventory below reflects the source package when this skill was authored and may evolve.

## Entrypoints

| Import | Purpose |
| --- | --- |
| `@murga.ing/components` | Component classes, `defineMc*()` functions, registry, and public component argument types |
| `@murga.ing/components/register` | `registerMurgaComponents()` |
| `@murga.ing/components/react` | JSX type augmentation, React wrappers, wrapper prop types, and registration re-export |
| `@murga.ing/components/components/mc-*` | One component and its `defineMc*()` function |

The root and component entrypoints do not register custom elements as an import side effect.
Version 1.0.0 does not expose a font asset entrypoint.

## Install Geist Pixel Line

Treat the font as an application asset. Copy an approved Geist Pixel Line WOFF2 file into the React
application's public directory instead of importing it from TypeScript or relying on an installed
system font. Check the installed package exports before assuming a future version bundles it.

For a single Vite React application:

```bash
mkdir -p public/fonts
cp /path/to/GeistPixel-Line.woff2 public/fonts/GeistPixel-Line.woff2
```

For a Bun workspace shaped like `apps/<app>`, run from the workspace root and target the specific
application:

```bash
mkdir -p apps/photos-admin/public/fonts
cp /path/to/GeistPixel-Line.woff2 apps/photos-admin/public/fonts/GeistPixel-Line.woff2
```

Declare the font near the top of the application's global tokens or stylesheet:

```css
@font-face {
  font-family: "Geist Pixel Line";
  src: url("/fonts/GeistPixel-Line.woff2") format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}

:root {
  --font-display: "Geist Pixel Line", "Space Mono", monospace;
}
```

Import that global stylesheet once from the React entrypoint:

```tsx
import "./styles/global.css";
```

Use the display face selectively:

```css
.page-title,
.hero-value {
  font-family: var(--font-display);
  font-weight: 400;
}
```

Do not use Geist Pixel Line for body copy, form values, or small labels. Keep it for large display
headings and hero data. Do not commit references to a developer's local font directory.

## React Setup

For Vite and similar client-rendered applications, create or reuse a bootstrap module:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { registerMurgaComponents } from "@murga.ing/components/register";
import "@murga.ing/components/react";

import { App } from "./App";

registerMurgaComponents();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

For Next.js or another SSR framework, use its client-module convention:

```tsx
"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import "@murga.ing/components/react";

export function MurgaProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void import("@murga.ing/components/register").then(({ registerMurgaComponents }) => {
      registerMurgaComponents();
    });
  }, []);

  return children;
}
```

Prefer an existing client bootstrap or provider if the application already has one. A dynamic import avoids evaluating registration code in the server environment. Check whether the framework requires suppressing or preventing pre-upgrade custom-element rendering; do not add `suppressHydrationWarning` without an observed mismatch.

## Direct JSX Versus Wrappers

Direct tags are a good fit for:

- `mc-badge`
- `mc-button`
- `mc-field`
- `mc-inline-message`
- `mc-overview-panel`
- `mc-status-text`
- `mc-theme-switcher` in React versions that support custom-element events as declared

Wrappers are exported for:

| Wrapper | Important properties | Typed callbacks |
| --- | --- | --- |
| `McAppShell` | `sidebarOpen`, `mobileOverlay` | `onMcSidebarOpenChange` |
| `McCheckbox` | `checked`, `name`, `value`, `disabled`, `required`, `ariaLabel` | `onMcChange` |
| `McConfirmAction` | `open`, `tone`, labels, `disabled`, `pending` | `onMcConfirm`, `onMcCancel`, `onMcOpenChange` |
| `McInput` | `value`, form properties, `invalid`, `ariaLabel` | `onMcInput`, `onMcChange` |
| `McMediaBrowser` | `items`, `selectedId`, `showRail`, `emptyLabel` | `onMcSelect` |
| `McNavList` | `items`, `ariaLabel`, `orientation` | `onMcSelect` |
| `McPagination` | `page`, `pageSize`, `total`, `hasMore`, `disabled` | `onMcPageChange` |
| `McRelationshipPanel` | `title`, `items`, `emptyLabel` | `onMcSelect` |
| `McResourceEditor` | title/status and dirty/busy flags | `onMcSave`, `onMcCancel`, `onMcDelete` |
| `McResourceTable` | `columns`, `rows`, `selectedId`, loading/empty state | `onMcRowSelect`, `onMcSort` |
| `McSearchField` | `value`, form properties, `pending` | `onMcInput`, `onMcChange`, `onMcClear` |
| `McSelect` | `options`, `selectedId`, form properties, `open`, `ariaLabel` | `onMcChange`, `onMcOpenChange` |
| `McSidebarNav` | item groups, labels, `open` | `onMcSelect`, `onMcOpenChange` |
| `McTagList` | `items`, `selectedIds`, `interactive` | `onMcSelect` |
| `McTagPicker` | `options`, `selectedIds`, `inputId`, `disabled`, `open` | `onMcChange`, `onMcOpenChange` |
| `McTextarea` | `value`, form properties, `invalid`, `ariaLabel` | `onMcInput`, `onMcChange` |
| `McThumbnail` | item/image properties and state flags | `onMcSelect` |
| `McThumbnailRail` | `items`, `selectedId`, `ariaLabel`, `orientation` | `onMcSelect` |

The wrappers forward refs to the underlying custom element and map `ariaLabel` to `aria-label`.

## Event Details

| Callback or event | `event.detail` |
| --- | --- |
| `onMcInput`, `onMcChange` for text controls | `{ value: string }` |
| `McCheckbox` `onMcChange` | `{ checked: boolean, value: string }` |
| `McSelect` `onMcChange` | `{ selectedId: string \| null }` |
| `McTagPicker` `onMcChange` | `{ selectedIds: string[] }` |
| `McTagList` `onMcSelect` | `{ itemId: string, selectedIds: string[] }` |
| Selection callbacks | `{ selectedId: string }` |
| Open callbacks | `{ open: boolean }` |
| `onMcPageChange` | `{ page: number }` |
| `onMcSort` | `{ columnId: string }` |
| `onMcRowSelect` | `{ selectedId: string }` |
| `onMcConfirm` | `{ confirmed: boolean }` |
| Resource editor action callbacks | `{ action: "save" \| "cancel" \| "delete" }` |
| `mc-theme-change` | `{ theme: "dark" \| "light" }` |

Murga events bubble and cross the shadow boundary. Prefer the supplied callback on the nearest owning component.

## Controlled Examples

```tsx
import { useState } from "react";
import { McCheckbox, McInput, McSelect } from "@murga.ing/components/react";

const options = [
  { id: "draft", label: "Draft" },
  { id: "published", label: "Published" },
];

export function FormControls() {
  const [title, setTitle] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  return (
    <>
      <McInput value={title} onMcInput={(event) => setTitle(event.detail.value)} />
      <McCheckbox
        checked={featured}
        value="featured"
        onMcChange={(event) => setFeatured(event.detail.checked)}
      >
        Featured
      </McCheckbox>
      <McSelect
        options={options}
        selectedId={status}
        onMcChange={(event) => setStatus(event.detail.selectedId)}
      />
    </>
  );
}
```

Use immutable arrays and objects where practical. Do not mutate a collection in place and expect React or Lit to detect the change.

## Slots And Composition

Pass ordinary content as children. Set named slots on native elements:

```tsx
<mc-button variant="primary">
  <span slot="icon-start" aria-hidden="true">
    +
  </span>
  Create
</mc-button>
```

Inspect the component's rendered slots or declarations before assuming a slot name. Do not recreate internal buttons, labels, or listbox behavior in React.

## Troubleshooting

### Unknown custom element at runtime

Confirm `registerMurgaComponents()` or the matching `defineMc*()` function executed in the browser. Importing `@murga.ing/components` alone is insufficient.

### JSX says the tag does not exist

Import `@murga.ing/components/react` from a TypeScript file included by the application's `tsconfig`. Confirm the installed package exposes the `./react` entrypoint.

### Custom callback never fires

Use the wrapper's exact `onMc*` prop. For a direct tag, use the exact literal custom-event prop supported by the installed React typings, or attach an event listener through a ref when the React version lacks custom-element event support.

### Array or object arrives as a string

Use the React wrapper and pass the value as a property. Do not JSON-stringify it into an attribute.

### `customElements is not defined`

Registration ran during server evaluation. Move it behind the framework's client boundary or a browser-only dynamic import.

### Props differ from this reference

Trust the installed declaration files over this document. Inspect:

```text
node_modules/@murga.ing/components/dist/react.d.ts
node_modules/@murga.ing/components/dist/components/<component>/index.d.ts
node_modules/@murga.ing/components/package.json
```

Avoid deep imports outside the package's declared `exports`.
