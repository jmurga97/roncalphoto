# 004 — Reduced motion: a gentle crossfade instead of a hard cut

- **Status**: DONE
- **Commit**: 2fb5827
- **Severity**: LOW
- **Category**: Accessibility
- **Estimated scope**: 3 files, ~15 lines
- **Depends on**: 001 (uses its `--duration-stage-*` tokens, its `setPhotoId` shape and its view-transition CSS)

## Problem

With `prefers-reduced-motion: reduce`, opening or closing the session stage is an instant cut. The view transition
is skipped entirely:

```ts
// apps/photos/src/pages/canvas/hooks/use-canvas-view-model.ts — after plan 001
      viewTransition: transition && !prefersReducedMotion() ? { types } : false,
```

On top of that, every live animation is forced to 0.01ms:

```css
/* apps/photos/src/app/styles/gallery.css:87-101 — current (unchanged by plan 001 except the selector) */
@media (prefers-reduced-motion: reduce) {
  .gallery-enter {
    animation: none;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Reduced motion means fewer and gentler animations, not none. Removing travel is right; removing the fade that
explains "a layer opened over the canvas" is not.

## Target

Under reduced motion:

- The view transition still runs, as a **200ms opacity-only** crossfade (`--ease-out`).
- The photo does **not** travel or resize: the `photo-focus` group's animation is turned off. Its old and new
  images just crossfade at the final position.
- The panel's slide and the mobile sheet's rise stay removed. The existing global 0.01ms rule already does that,
  and it does not reach `::view-transition-*` pseudo-elements, because `*` doesn't match them.

```css
/* target — apps/photos/src/app/styles/tokens.css, directly after the Motion `:root { … }` block from plan 001 */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-stage-open: 200ms;
    --duration-stage-close: 200ms;
  }
}
```

```css
/* target — apps/photos/src/app/styles/canvas.css, directly after the
   `::view-transition-old(photo-focus), ::view-transition-new(photo-focus) { … }` rule from plan 001 */
/* Reduced motion: no travel, the photo crossfades in place while the stage fades. */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(photo-focus) {
    animation: none;
  }
}
```

## Repo conventions to follow

- Motion tokens are the plain `:root { … }` block at the end of `apps/photos/src/app/styles/tokens.css` (added by
  plan 001). Override them there under the media query; it has the same specificity and comes later, so it wins.
- `prefersReducedMotion()` (`apps/photos/src/utils/prefers-reduced-motion.ts`) stays in use elsewhere (camera
  tweens, gallery scroll). Only the import in `use-canvas-view-model.ts` goes.

## Steps

1. **tokens.css**: add the reduced-motion block from Target right after the Motion `:root { … }` block.
2. **canvas.css**: add the reduced-motion block from Target right after the
   `::view-transition-old(photo-focus), ::view-transition-new(photo-focus)` rule.
3. **use-canvas-view-model.ts**: change the `viewTransition` line to

   ```ts
         viewTransition: transition ? { types } : false,
   ```

   and delete `import { prefersReducedMotion } from "@utils/prefers-reduced-motion";` (line 7). It has no other use
   in this file; confirm with `grep -n prefersReducedMotion apps/photos/src/pages/canvas/hooks/use-canvas-view-model.ts`,
   which must print nothing afterwards.

## Boundaries

- Do NOT edit the global `*` reduced-motion rule in `gallery.css`.
- Do NOT touch `preloadImage`, the camera hook, or gallery scrolling.
- If plan 001 is not merged (no `--duration-stage-open` token, no `{ types }` in `setPhotoId`), STOP: this plan
  depends on it.

## Verification

- **Mechanical**: `bun run check`, `bun run lint`, `bun run build`, `bun run test:e2e`, all clean.
- **Feel check**: DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce", then reload
  `http://localhost:5174` (`bun run dev:local`).
  - Open a tile: the stage fades in over ~200ms; the photo does not fly, grow or move. It fades in at its final
    place. The panel does not slide.
  - Close: the stage fades out over ~200ms; the photo does not fly back.
  - Mobile viewport: the sheet appears without rising.
  - Turn the emulation off and reload: the full 420/340ms choreography from plan 001 is back.
- **Done when**: under reduced motion, the Animations panel shows only opacity animations of 200ms for open/close,
  and no transform animation.
