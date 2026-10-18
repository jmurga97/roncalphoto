# 003 — Closing the stage always flies the photo back to its tile

- **Status**: DONE
- **Commit**: 2fb5827
- **Severity**: MEDIUM
- **Category**: Missed opportunities (spatial continuity)
- **Estimated scope**: 2 files, ~25 lines

## Problem

Inside the session stage the user scrolls through the session's photos, and each scroll updates the selected
photo. When they close, the photo should fly back into its tile on the canvas. It only does that if that tile
happens to be on screen:

```tsx
// apps/photos/src/pages/canvas/canvas-view.tsx:147-154 — current
const closePhoto = () => {
  const placement = selectedPhotoId ? placementsById.get(selectedPhotoId) : undefined;
  const isTileVisible = placement && isPlacementVisible(placement, camera.cameraRef.current, getViewportSize());

  // Morph back into the tile only when it is on screen; otherwise just fade.
  flushSync(() => setTransitionPhotoId(isTileVisible ? selectedPhotoId : undefined));
  setPhotoId(undefined);
};
```

The tiles are shuffled across the whole wall, so after scrolling a few photos the current tile is usually off
screen. The photo then just fades out in place and the canvas shows no connection to where you were. The stage
covers the canvas completely (blurred, 86% opaque backdrop), so the camera can be moved under it invisibly. The
existing camera can't do that synchronously, though: `setCamera` writes the transform on the next animation frame,
which may come after the view transition's snapshot.

```ts
// apps/photos/src/pages/canvas/hooks/use-canvas-camera.ts:31-50 — current
const setCamera = useCallback(
  (camera: Camera) => {
    cameraRef.current = constrain(camera);

    if (applyFrameRef.current !== null) {
      return;
    }

    applyFrameRef.current = requestAnimationFrame(() => {
      applyFrameRef.current = null;
      const world = worldRef.current;

      if (world) {
        const { x, y, scale } = cameraRef.current;
        world.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      }
    });
  },
  [constrain, worldRef],
);
```

## Target

On close, if the selected photo's tile is off screen, the camera jumps **synchronously** (same scale) to centre
that tile, while the stage still covers the canvas. The tile then always takes the `photo-focus` name and the
photo always morphs home. Nothing new animates: the jump is hidden, and the motion is the existing morph.

## Repo conventions to follow

- Camera writes go through `useCanvasCamera` (`apps/photos/src/pages/canvas/hooks/use-canvas-camera.ts`), and every
  camera passes through `constrain`. The new `jumpTo` must too.
- Camera maths comes from `apps/photos/src/pages/canvas/utils/camera-math.ts`. `cameraCenteredOn(placement, viewport,
scale)` and `isPlacementVisible(placement, camera, viewport)` already exist and are already imported in
  `canvas-view.tsx`. Exemplar: `revealPhoto` at `canvas-view.tsx:156-167` uses both the same way.

## Steps

1. **use-canvas-camera.ts**: add a module-level helper above `export function useCanvasCamera` and use it in
   `setCamera`, so the transform string exists once:

   ```ts
   function writeTransform(world: HTMLDivElement | null, { x, y, scale }: Camera) {
     if (world) {
       world.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
     }
   }
   ```

   The `requestAnimationFrame` callback in `setCamera` becomes:

   ```ts
   applyFrameRef.current = requestAnimationFrame(() => {
     applyFrameRef.current = null;
     writeTransform(worldRef.current, cameraRef.current);
   });
   ```

2. **use-canvas-camera.ts**: after `stopAnimation` (lines 52-57), add:

   ```ts
   // Writes the camera now, not on the next frame: for jumps that must land before a view-transition snapshot.
   const jumpTo = useCallback(
     (camera: Camera) => {
       stopAnimation();

       if (applyFrameRef.current !== null) {
         cancelAnimationFrame(applyFrameRef.current);
         applyFrameRef.current = null;
       }

       cameraRef.current = constrain(camera);
       writeTransform(worldRef.current, cameraRef.current);
     },
     [constrain, stopAnimation, worldRef],
   );
   ```

   Add `jumpTo: (camera: Camera) => void;` to `CanvasCameraControls` (alphabetical, after `cameraRef`), and to the
   returned object at line 102:
   `useMemo(() => ({ animateTo, cameraRef, jumpTo, setCamera, stopAnimation }), [animateTo, jumpTo, setCamera, stopAnimation])`.

3. **canvas-view.tsx**: replace `closePhoto` (lines 147-154) with:

   ```tsx
   const closePhoto = () => {
     const placement = selectedPhotoId ? placementsById.get(selectedPhotoId) : undefined;
     const viewport = getViewportSize();
     const current = camera.cameraRef.current;

     // The stage still covers the canvas, so an off-screen tile is brought into view
     // unseen and the photo always morphs back into it.
     if (placement && !isPlacementVisible(placement, current, viewport)) {
       camera.jumpTo(cameraCenteredOn(placement, viewport, current.scale));
     }

     flushSync(() => setTransitionPhotoId(placement ? selectedPhotoId : undefined));
     setPhotoId(undefined);
   };
   ```

## Boundaries

- Do NOT animate the camera on close (`animateTo`). The jump must be instant and hidden; the morph is the motion.
- Do NOT change `openPhoto`, `revealPhoto`, the CSS, or `use-canvas-view-model.ts`.
- Do NOT change the zoom level on close: pass `current.scale`.
- If an excerpt doesn't match the file (drift since 2fb5827, or since plan 002 changed `openPhoto`), STOP and report.

## Verification

- **Mechanical**: `bun run check`, `bun run lint`, `bun run build`, `bun run test:e2e`, all clean.
- **Feel check** (`bun run db:seed:local && bun run dev:local`, `http://localhost:5174`):
  - Open a tile, scroll down 3–4 photos in the stage, close with ✕. The photo flies back into **its own** tile
    (the one for the photo you were viewing), now centred on the canvas.
  - Same with Escape and with a click beside the photo.
  - At 10% playback (Animations panel), watch the blurred backdrop at the very start of close. The canvas behind it
    must not visibly shift or flash. If a shift is visible through the blur, report it.
  - Open a tile, close without scrolling. The camera does **not** move (the tile was already visible).
  - Zoom far out (Ctrl + wheel), open, scroll, close. The zoom level is kept; only the position changes.
  - After close, keyboard focus is on the tile (existing behaviour, `canvas-view.tsx:126-137`).
- **Done when**: closing after scrolling inside the stage morphs into the matching tile in 5 of 5 tries, with no
  visible camera jump.
