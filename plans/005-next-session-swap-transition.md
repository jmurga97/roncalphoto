# 005 — Animate "Siguiente sesión" inside the stage

- **Status**: DONE
- **Commit**: 2fb5827
- **Severity**: LOW (additive)
- **Category**: Missed opportunities
- **Estimated scope**: 4 files, ~45 lines
- **Depends on**: 001 (tokens, wildcard view-transition timing, `setPhotoId` shape). Apply after 004 and 006 if
  those are planned: 004's reduced-motion handling is extended here, and 006 reshapes `canvas-photo-stage.tsx`.

## Problem

On the last photo of a session, the stage's info panel offers "Siguiente sesión". Clicking it is a hard cut: the
gallery remounts (keyed by slug) and the panel text snaps to the new session, with no transition. That breaks the
otherwise continuous canvas → stage flow.

```tsx
// apps/photos/src/pages/canvas/components/canvas-photo-info.tsx:116-121 — current
        {nextSession && position === session.photos.length ? (
          <button
            className="group flex items-center justify-between gap-3 …"
            onClick={() => onOpenSession(nextSession.photos[0].id)}
            type="button"
          >
```

```tsx
// apps/photos/src/pages/canvas/components/canvas-photo-stage.tsx:119-128 — current
      {photo ? (
        <CanvasPhotoInfo
          nextSession={nextSession}
          onClose={onClose}
          onOpenSession={onSelectPhoto}
          …
```

```tsx
// apps/photos/src/pages/canvas/canvas-view.tsx:242-250 — current
{
  selectedPhotoId && selectedSession ? (
    <CanvasPhotoStage
      nextSession={nextSession}
      onClose={closePhoto}
      onSelectPhoto={(photoId) => setPhotoId(photoId, { replace: true, transition: false })}
      selectedPhotoId={selectedPhotoId}
      session={selectedSession}
    />
  ) : null;
}
```

`onSelectPhoto` is the scroll-driven update (correctly no transition); the session swap reuses it.

## Target

The swap runs as a view transition of type `stage-swap`, at the close duration (340ms, `--ease-out`):

- The panel text and thumbnails crossfade through the root crossfade from plan 001; the panel box itself doesn't move.
- The current photo **lifts away** (opacity → 0, `translateY(-4%)`) and the next session's first photo **rises in**
  (from opacity 0, `translateY(4%)`). That matches the gallery's vertical scroll, where "next" comes from below.
- The `photo-focus` group's geometry animation is off for the swap, so two unrelated photos never morph into each
  other. The old photo is drawn `object-fit: contain`, so it keeps its own framing inside the new photo's box while
  it fades.
- Browsers without view-transition types keep today's hard cut. Without the type the CSS can't tell a swap apart,
  and the photos would morph.
- Reduced motion: opacity-only crossfade, no lift.

```css
/* target — apps/photos/src/app/styles/canvas.css, after the photo-focus rules (and after plan 004's block) */
/* Next session inside the stage: the current photo lifts away, the next one rises in. */
:root:active-view-transition-type(stage-swap) {
  --duration-stage: var(--duration-stage-close);
}

:root:active-view-transition-type(stage-swap)::view-transition-group(photo-focus) {
  animation: none;
}

:root:active-view-transition-type(stage-swap)::view-transition-old(photo-focus) {
  object-fit: contain;
  animation-name: stage-swap-out;
}

:root:active-view-transition-type(stage-swap)::view-transition-new(photo-focus) {
  animation-name: stage-swap-in;
}

@keyframes stage-swap-out {
  to {
    opacity: 0;
    transform: translateY(-4%);
  }
}

@keyframes stage-swap-in {
  from {
    opacity: 0;
    transform: translateY(4%);
  }
}

@media (prefers-reduced-motion: reduce) {
  :root:active-view-transition-type(stage-swap)::view-transition-old(photo-focus) {
    animation-name: stage-fade-out;
  }

  :root:active-view-transition-type(stage-swap)::view-transition-new(photo-focus) {
    animation-name: stage-fade-in;
  }
}

@keyframes stage-fade-out {
  to {
    opacity: 0;
  }
}

@keyframes stage-fade-in {
  from {
    opacity: 0;
  }
}
```

Only `animation-name` is overridden. Duration and curve still come from plan 001's
`::view-transition-old(*), ::view-transition-new(*)` rule, so the swap stays on the shared clock.

## Repo conventions to follow

- Stage navigation goes only through `setPhotoId` in
  `apps/photos/src/pages/canvas/hooks/use-canvas-view-model.ts`. Exemplar: plan 001's `types` handling there.
- Props are listed alphabetically in component interfaces (see `CanvasPhotoStageProps`,
  `canvas-photo-stage.tsx:13-19`).
- `unicorn/no-nested-ternary` is an error (`.oxlintrc.jsonc:502`); use early returns as below.

## Steps

1. **use-canvas-view-model.ts**: widen the option type (lines 29-33):

   ```ts
   interface SetPhotoOptions {
     // Scroll-driven updates inside the stage replace the entry and skip the view transition;
     // "swap" moves the open stage to another session.
     replace?: boolean;
     transition?: boolean | "swap";
   }
   ```

   Above `export function useCanvasViewModel`, add:

   ```ts
   // Without view-transition types the swap CSS can't apply and two unrelated photos would morph, so it stays a cut.
   const supportsViewTransitionTypes =
     typeof CSS !== "undefined" && CSS.supports("selector(:active-view-transition-type(a))");

   function toStageViewTransition(photoId: string | undefined, transition: boolean | "swap") {
     if (transition === "swap") {
       return supportsViewTransitionTypes ? { types: ["stage-swap"] } : false;
     }

     return transition ? { types: [photoId ? "stage-open" : "stage-close"] } : false;
   }
   ```

   In `setPhotoId`, delete the `const types = …;` line and set
   `viewTransition: toStageViewTransition(photoId, transition),`.
   If plan 004 has **not** been applied, `setPhotoId` still checks `prefersReducedMotion()`. In that case keep
   that behaviour:
   `viewTransition: prefersReducedMotion() ? false : toStageViewTransition(photoId, transition),`.

2. **canvas-photo-stage.tsx**: add `onOpenSession: (photoId: string) => void;` to `CanvasPhotoStageProps` (after
   `onClose`), destructure it in `CanvasPhotoStage`, and pass `onOpenSession={onOpenSession}` to `CanvasPhotoInfo`
   instead of `onOpenSession={onSelectPhoto}`. After plan 006, `CanvasPhotoInfo` is built in a `const details = …`
   block (portalled into the sidebar on desktop); change the prop there.

3. **canvas-view.tsx**: on `<CanvasPhotoStage …>` add, after `onClose={closePhoto}`:

   ```tsx
             onOpenSession={(photoId) => setPhotoId(photoId, { replace: true, transition: "swap" })}
   ```

4. **canvas.css**: add the Target CSS block after the photo-focus rules (after plan 004's reduced-motion block, if
   present).

## Boundaries

- Do NOT change scroll-driven selection (`onSelectPhoto` stays `transition: false`).
- Do NOT change `canvas-photo-info.tsx`; its `onOpenSession` prop already exists.
- Do NOT add view-transition names to the panel; `.glass` backdrop blur must stay in the live root.
- Known and out of scope: the "Siguiente sesión" button unmounts after the swap, so focus falls back to `body`.
  Note it in your report; do not fix it here.
- If plan 001 is not merged, STOP: this plan depends on it.

## Verification

- **Mechanical**: `bun run check`, `bun run lint`, `bun run build`, `bun run test:e2e`, all clean.
- **Feel check** (`bun run dev:local`, Chrome, `http://localhost:5174`):
  - Open a session, scroll to its last photo, click "Siguiente sesión". The current photo lifts slightly and fades
    while the next session's first photo rises in. The session details (in the sidebar card on desktop after plan 006) crossfade in place. Total ≈340ms.
  - At 10% playback: the two photos never stretch or morph into each other. A landscape → portrait swap shows the old
    photo letterboxed (not cropped) as it leaves.
  - Scroll between photos inside the stage: still no view transition (scroll is the motion).
  - Close after a swap: the photo flies back to the new session's tile (plan 003 behaviour).
  - Reduced-motion emulation: the swap is a plain crossfade with no lift.
  - In a browser without `:active-view-transition-type` support: the swap is an instant cut, as before.
- **Done when**: the swap animates as described in Chrome and Safari 18+, and nothing else in the stage changed.
