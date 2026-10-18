# 001 — Run the canvas ↔ session stage on one clock

- **Status**: DONE
- **Commit**: 2fb5827
- **Severity**: HIGH
- **Category**: Cohesion & tokens / Easing & duration (merges audit findings 1 and 2)
- **Estimated scope**: 5 files, ~60 lines removed, ~25 added

## Problem

Opening a photo from the canvas (`/`) starts a view transition (TanStack Router `viewTransition`). The clicked
tile morphs into the session stage's gallery slide (shared name `photo-focus`). Everything around that morph runs
on its own, unrelated timeline, and on close most of it disappears on the first frame.

**1. The root snapshot crossfade is disabled.**

```css
/* apps/photos/src/app/styles/gallery.css:21-61 — current */
@supports (view-transition-name: none) {
  .gallery-stage-enter {
    animation: none;
  }

  ::view-transition-group(root) {
    animation: none;
  }

  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
  }

  ::view-transition-old(root) {
    opacity: 0;
  }

  ::view-transition-new(root) {
    opacity: 1;
  }

  ::view-transition-group(session-stage) {
    animation-duration: 720ms;
    animation-timing-function: cubic-bezier(0.2, 0.9, 0.2, 1);
    isolation: isolate;
  }

  ::view-transition-old(session-stage),
  ::view-transition-new(session-stage) {
    mix-blend-mode: normal;
  }

  ::view-transition-old(session-stage) {
    animation: session-stage-out 720ms cubic-bezier(0.2, 0.9, 0.2, 1);
  }

  ::view-transition-new(session-stage) {
    animation: session-stage-in 720ms cubic-bezier(0.2, 0.9, 0.2, 1);
  }
}
```

On **close** the old root snapshot (which contains the blurred backdrop, the info panel and the gallery chrome) is
set to `opacity: 0` with no animation. All of it vanishes on frame 1. The gallery's `session-stage` group then
keeps fading for 720ms over a canvas that is already sharp, while the photo flies back over 460ms. On **open** the
backdrop, panel, gallery and photo each run their own animation:

| Element                         | Where                | Duration / curve                                               |
| ------------------------------- | -------------------- | -------------------------------------------------------------- |
| Photo morph                     | `canvas.css:236-247` | 460ms `cubic-bezier(0.22, 1, 0.36, 1)`                         |
| Backdrop `.canvas-focus`        | `canvas.css:142`     | 280ms `ease` (live keyframe)                                   |
| Info panel `.canvas-focus-info` | `canvas.css:161`     | 420ms `cubic-bezier(0.22, 1, 0.36, 1)`, opacity + translate    |
| Gallery `session-stage`         | `gallery.css:43-60`  | 720ms `cubic-bezier(0.2, 0.9, 0.2, 1)`, starts at opacity 0.18 |

720ms is more than double the 300ms UI budget. Starting at 0.18 opacity puts a ghost of the gallery on frame 1.
The panel fades its own opacity on top of the backdrop fade, so it fades twice.

```css
/* apps/photos/src/app/styles/canvas.css:133-143 — current */
.canvas-focus {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  grid-template-columns: minmax(0, 1fr) min(26rem, 34vw);
  background-color: color-mix(in srgb, var(--color-bg) 86%, transparent);
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
  animation: canvas-fade-in 280ms ease both;
}
```

```css
/* apps/photos/src/app/styles/canvas.css:161 — current (inside .canvas-focus-info) */
animation: canvas-info-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
```

```css
/* apps/photos/src/app/styles/canvas.css:222-227 — current */
@keyframes canvas-info-in {
  from {
    opacity: 0;
    transform: translateX(1.5rem);
  }
}
```

```css
/* apps/photos/src/app/styles/canvas.css:235-247 — current */
/* Canvas tile ↔ session slide morph (see PHOTO_FOCUS_TRANSITION_NAME). */
::view-transition-group(photo-focus) {
  animation-duration: 460ms;
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

::view-transition-old(photo-focus),
::view-transition-new(photo-focus) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation-duration: 460ms;
}
```

```tsx
// apps/photos/src/pages/gallery/components/gallery-grid.tsx:51-52 — current
    <div data-gallery-root className="photo-stage gallery-stage-enter flex h-full flex-col">
      <div className="relative min-h-0 w-full flex-1" style={{ viewTransitionName: "session-stage" }}>
```

```ts
// apps/photos/src/pages/canvas/hooks/use-canvas-view-model.ts:95-102 — current
function setPhotoId(photoId?: string, { replace = false, transition = true }: SetPhotoOptions = {}) {
  void navigate({
    replace,
    search: (previousSearch) => ({ ...previousSearch, photo: photoId }),
    to: "/",
    viewTransition: transition && !prefersReducedMotion(),
  });
}
```

## Target

One transition, one curve, one duration per direction. The canvas is pixel-identical in the old and new root
snapshots, so a root crossfade fades exactly the stage layer in or out: backdrop **and its blur**, panel, gallery
chrome. Backdrop blur keeps working because it stays in the live root rather than in a separately captured group.
The photo morph runs on the same clock. Close is faster than open (the system's response snaps).

- Curve: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`. One strong ease-out for everything, morph included. This is a
  deliberate choice over ease-in-out for the morph: the morph is click-initiated and must respond on frame 1. Every
  part must share one curve, or the morph and the fade drift apart.
- Open: `420ms`. Close: `340ms`. The direction is passed as a view-transition type (`stage-open` / `stage-close`).
  Browsers without type support (`:active-view-transition-type`) still get the transition, at the open duration.

```css
/* target — apps/photos/src/app/styles/tokens.css, a new block at the end of the file */
/* Motion (theme-independent) */
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --duration-stage-open: 420ms;
  --duration-stage-close: 340ms;
  --duration-stage: var(--duration-stage-open);
}
```

```css
/* target — apps/photos/src/app/styles/canvas.css, replacing lines 235-247 */
/* Canvas ↔ session stage: one view transition, one clock. The root crossfade fades the
   stage layer (backdrop blur included) while the tile morphs (see PHOTO_FOCUS_TRANSITION_NAME). */
:root:active-view-transition-type(stage-close) {
  --duration-stage: var(--duration-stage-close);
}

::view-transition-group(*),
::view-transition-old(*),
::view-transition-new(*) {
  animation-duration: var(--duration-stage);
  animation-timing-function: var(--ease-out);
}

::view-transition-old(photo-focus),
::view-transition-new(photo-focus) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

## Repo conventions to follow

- Design tokens live in `apps/photos/src/app/styles/tokens.css` (e.g. `--radius-md: 0.9rem;` at line 46). Motion
  tokens are theme-independent and get their own plain `:root { … }` block at the end of the file. Do not put them in
  the `:root, html[data-theme="light"]` block: `html[data-theme="light"]` has higher specificity, so a later
  `@media (prefers-reduced-motion: reduce) { :root { … } }` override (plan 004) would lose to it.
- Stage styles live in `apps/photos/src/app/styles/canvas.css`. The view-transition CSS for the stage moves there
  entirely. After this plan, `gallery.css` holds no view-transition rules.
- Navigation for the stage goes through `setPhotoId` in `use-canvas-view-model.ts`; do not call `navigate` elsewhere.

## Steps

1. **tokens.css**: append the `/* Motion (theme-independent) */ :root { … }` block shown in Target at the end of
   the file, after the `html[data-theme="dark"] { … }` block.

2. **canvas.css `.canvas-focus`** (line 142): replace
   `animation: canvas-fade-in 280ms ease both;` with
   `animation: canvas-fade-in var(--duration-stage-open) var(--ease-out) both;`.
   Directly after the `.canvas-focus { … }` rule, add:

   ```css
   /* With view transitions the root crossfade fades the stage in; this keyframe is the fallback. */
   @supports (view-transition-name: none) {
     .canvas-focus {
       animation: none;
     }
   }
   ```

3. **canvas.css `.canvas-focus-info`** (line 161): replace
   `animation: canvas-info-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both;` with
   `animation: canvas-info-in var(--duration-stage-open) var(--ease-out) both;`.
   The mobile override `animation-name: canvas-sheet-in;` (line 187) stays as is.

4. **canvas.css `@keyframes canvas-info-in`** (lines 222-227): drop the opacity so the panel only slides (the root
   crossfade or the `.canvas-focus` fallback fade already handles its opacity):

   ```css
   @keyframes canvas-info-in {
     from {
       transform: translateX(1.5rem);
     }
   }
   ```

   Leave `@keyframes canvas-fade-in` alone: `.canvas-hint` (line 128) also uses it.

5. **canvas.css view-transition block** (lines 235-247): replace with the Target block from `canvas.css` above.

6. **gallery.css**: delete
   - the `.gallery-stage-enter { … }` rule (lines 5-7),
   - the whole `@supports (view-transition-name: none) { … }` block (lines 21-61),
   - `@keyframes session-stage-in` and `@keyframes session-stage-out` (lines 63-85),
   - `.gallery-stage-enter` from the reduced-motion selector at lines 88-89, so it reads `.gallery-enter {`.

7. **gallery-grid.tsx** (lines 51-52): remove the `gallery-stage-enter` class and the `session-stage` name:

   ```tsx
       <div data-gallery-root className="photo-stage flex h-full flex-col">
         <div className="relative min-h-0 w-full flex-1">
   ```

8. **use-canvas-view-model.ts** (lines 95-102): pass the direction as a type. The `const` keeps
   `unicorn/no-nested-ternary` (`.oxlintrc.jsonc:502`) happy:

   ```ts
   function setPhotoId(photoId?: string, { replace = false, transition = true }: SetPhotoOptions = {}) {
     const types = [photoId ? "stage-open" : "stage-close"];

     void navigate({
       replace,
       search: (previousSearch) => ({ ...previousSearch, photo: photoId }),
       to: "/",
       viewTransition: transition && !prefersReducedMotion() ? { types } : false,
     });
   }
   ```

   `viewTransition` accepts `boolean | { types: string[] }` (TanStack Router `ViewTransitionOptions`). Keep the
   `prefersReducedMotion` import; plan 004 changes it.

## Boundaries

- Do NOT touch the canvas camera (`use-canvas-camera.ts`), `closePhoto`/`openPhoto` in `canvas-view.tsx`, or
  `gallery-slide.tsx`. Plans 002 and 003 own those.
- Do NOT change `.canvas-photo` hover/dim transitions or `.canvas-hint`.
- Do NOT add view-transition names to `.canvas-focus` or `.canvas-focus-info`. They use `backdrop-filter` (`.glass`
  in `base.css:65-73`), and a separately captured group loses its backdrop blur during the transition.
- Do NOT add dependencies. If any excerpt above doesn't match the file (drift since 2fb5827), STOP and report.

## Verification

- **Mechanical**: `bun run check` (no type errors), `bun run lint` (no warnings), `bun run build`,
  `bun run test:e2e` (admin suite, must stay green). Also run
  `grep -rn "session-stage\|gallery-stage-enter" apps/photos/src`, which must print nothing.
- **Feel check**: `bun run db:seed:local && bun run dev:local`, open `http://localhost:5174` in Chrome.
  - Click a tile. The backdrop blur, panel and photo arrive **together**, with no element landing after the
    others. No gallery ghost on frame 1.
  - Close (✕, Escape, or click beside the photo). The blur, backdrop and panel **fade out** together with the photo
    flying back, with nothing vanishing instantly. Close feels slightly quicker than open.
  - DevTools → Animations panel, playback 10%: open and close each show one group of animations, all ending at the
    same moment (420ms open, 340ms close). The canvas behind does not flicker or brighten mid-crossfade (identical
    pixels under `plus-lighter` must be stable).
  - Mobile viewport (375×812): the bottom sheet slides up from below while the stage fades in. No double fade.
  - In Firefox or another browser without `:active-view-transition-type`, close still animates (at 420ms).
- **Done when**: every stage animation shares `var(--ease-out)`, open ends at 420ms and close at 340ms in the
  Animations panel, and nothing in the stage disappears on the first frame of close.
