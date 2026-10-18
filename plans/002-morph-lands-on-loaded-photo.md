# 002 — Make the tile → stage morph land on a photo that has a size

- **Status**: DONE
- **Commit**: 2fb5827
- **Severity**: HIGH (likely; confirm with step 1)
- **Category**: Physicality & origin
- **Estimated scope**: 4 files, ~30 lines

## Problem

Opening a canvas tile morphs it into the stage's gallery slide through the shared view-transition name
`photo-focus`. The browser snapshots the new state right after React mounts the stage. At that moment the slide's
full-size `<img>` has usually not loaded yet.

```tsx
// apps/photos/src/pages/gallery/components/gallery-slide.tsx:13-25 — current
export function GallerySlide({ isTransitionTarget = false, loading, photo }: GallerySlideProps) {
  return (
    <GalleryCard photoId={photo.id}>
      <img
        alt={photo.alt}
        className="max-h-full max-w-full object-contain"
        decoding="async"
        loading={loading}
        src={photo.imageSrc}
        style={isTransitionTarget ? { viewTransitionName: PHOTO_FOCUS_TRANSITION_NAME } : undefined}
      />
    </GalleryCard>
  );
}
```

The `<img>` gets its size only from the image's intrinsic dimensions. The photo schema stores no width/height
(`packages/db/src/schema/portfolio.ts`). An image that hasn't loaded is therefore a 0×0 box in the middle of the
slide. The morph shrinks the miniature into that point and fades it out, and the real photo pops in later with no
motion. The only preload runs on hover or pointerdown, and nothing waits for it:

```tsx
// apps/photos/src/pages/canvas/components/canvas-photo-node.tsx:26,42-43 — current
  const preloadFull = () => preloadImage(item.fullSrc);
  …
      onPointerDown={preloadFull}
      onPointerEnter={preloadFull}
```

```tsx
// apps/photos/src/pages/canvas/canvas-view.tsx:139-145 — current
const openPhoto = useCallback(
  (photoId: string) => {
    flushSync(() => setTransitionPhotoId(photoId));
    setPhotoId(photoId);
  },
  [setPhotoId],
);
```

On touch, pointerdown comes only about 100ms before click, so the broken morph is probably the normal case there.

The slide is also scrolled into place in a passive effect. If React flushes that after the snapshot, the
named slide is captured at its unscrolled position (off screen for any photo past the first):

```tsx
// apps/photos/src/pages/gallery/gallery-view.tsx:58-76 — current
  useEffect(() => {
    if (
      hasInitialScrollAlignedRef.current ||
      …
    ) {
      return;
    }

    pendingProgrammaticPhotoIdRef.current = galleryData.selection.normalizedPhotoId;
    scrollPhotoIntoView(containerRef.current, galleryData.selection.normalizedPhotoId, "auto");
    hasInitialScrollAlignedRef.current = true;
  }, [ … ]);
```

## Target

- Before navigating, `openPhoto` waits for the full image to **decode**, capped at **200ms**. A decoded image sits in
  the document's list of available images, so the slide's `<img>` lays out with its real size synchronously and the
  morph lands exactly on the photo.
- If decoding takes longer than 200ms (slow network), open **without** the shared element (`transitionPhotoId`
  undefined). The stage then just crossfades in (plan 001) and the photo appears when it loads. That is graceful,
  instead of morphing into a point.
- Hover preloading on desktop stays, so the wait there is usually 0ms.
- The initial slide alignment runs in `useLayoutEffect`, so the slide is in position before any snapshot.

Rejected alternative (do not implement it): showing the miniature as the slide `src` until the full image loads. The
slide is `max-h-full max-w-full object-contain`, so a 400px miniature renders at 400px and the box would jump on swap.

## Repo conventions to follow

- Image helpers live in `apps/photos/src/utils/preload-image.ts`. Add the new helper next to `preloadImage` in the
  same style (`new Image()`, `decoding = "async"`, `decode()` with an empty catch).
- Canvas timing constants live in `apps/photos/src/pages/canvas/constants.ts` as `SCREAMING_SNAKE_CASE` with
  an `_MS` suffix, e.g. `export const REVEAL_ANIMATION_MS = 320;` (line 24).
- `utils/` must not import from `lib/`, `components/` or `pages/` (Oxlint layered imports).

## Steps

1. **Check first (no code change).** Run `bun run db:seed:local && bun run dev:local` and open
   `http://localhost:5174` in Chrome. DevTools → Network → throttling "Fast 4G", tick "Disable cache". Tap or click
   a tile **without hovering it first** (move the pointer onto it and click immediately), then watch at 10% speed in
   the Animations panel. Expected bug: the tile shrinks into the centre of the stage and the photo pops in afterwards.
   If the morph already lands correctly in every try, STOP and report: the plan is unnecessary.

2. **preload-image.ts**: append:

   ```ts
   // Resolves true once the image is decoded (so <img src> lays out at its real size at once),
   // false when that takes longer than `timeoutMs`.
   export function waitForImage(imageSrc: string | undefined, timeoutMs: number): Promise<boolean> {
     if (!imageSrc) {
       return Promise.resolve(false);
     }

     const image = new Image();
     image.decoding = "async";
     image.src = imageSrc;

     const decoded = image.decode().then(
       () => true,
       () => false,
     );
     const timedOut = new Promise<boolean>((resolve) => {
       setTimeout(() => resolve(false), timeoutMs);
     });

     return Promise.race([decoded, timedOut]);
   }
   ```

   Do not change `preloadImage`.

3. **constants.ts**: after `export const REVEAL_ANIMATION_MS = 320;` add:

   ```ts
   // Longest wait for the full photo before opening; past it the stage opens without the morph.
   export const OPEN_DECODE_TIMEOUT_MS = 200;
   ```

4. **canvas-view.tsx**: import `OPEN_DECODE_TIMEOUT_MS` in the existing `./constants` import list (alphabetical,
   between `FOCUS_SESSION_MAX_SCALE` and `OVERVIEW_ANIMATION_MS`). Add
   `import { waitForImage } from "@utils/preload-image";` next to the other `@utils/` imports (after
   `@utils/prefers-reduced-motion`). Replace `openPhoto` (lines 139-145) with:

   ```tsx
   const openPhoto = useCallback(
     (photoId: string) => {
       void waitForImage(itemsById.get(photoId)?.fullSrc, OPEN_DECODE_TIMEOUT_MS).then((isFullReady) => {
         // Morph only into a photo the stage can lay out; otherwise the stage just fades in.
         flushSync(() => setTransitionPhotoId(isFullReady ? photoId : undefined));
         setPhotoId(photoId);
       });
     },
     [itemsById, setPhotoId],
   );
   ```

5. **gallery-view.tsx**: line 1 becomes `import { useEffect, useLayoutEffect, useRef } from "react";`. Change
   the effect at line 58 (the one calling `scrollPhotoIntoView(…, "auto")`) from `useEffect(` to
   `useLayoutEffect(`. Leave the `sessionSlug` reset effect at line 37 as `useEffect`. Add this comment above the
   changed hook:

   ```tsx
   // Layout effect: the opened slide must be in place before the view transition snapshots it.
   ```

## Boundaries

- Do NOT touch `gallery-slide.tsx`, the CSS files, `use-canvas-view-model.ts` or `closePhoto`.
- Do NOT add width/height to the schema or API. That would be a data-model change, out of scope.
- Do NOT remove the hover/pointerdown `preloadImage` calls; they are what make the wait 0ms on desktop.
- No new dependencies. If an excerpt doesn't match the file (drift since 2fb5827), STOP and report.

## Verification

- **Mechanical**: `bun run check`, `bun run lint`, `bun run build`, `bun run test:e2e`, all clean.
- **Feel check** (same setup as step 1, "Fast 4G" + cache disabled):
  - Click a tile without hovering first. The tile grows into the stage and lands exactly on the photo's final
    bounds; no point-shrink, no pop afterwards. At most ~200ms passes between click and motion start. It must not
    read as a frozen click; if it does, report it rather than raising the timeout.
  - Throttle to "Slow 3G" and click a fresh tile. The stage fades in without a morph, and the photo appears when
    loaded. No morph into the centre.
  - Click a tile far down a session (photo 4+). The morph flies to the visible slide, not toward the top or
    off screen.
  - Without throttling, after hovering a tile: the open is instant, as before.
  - Mobile viewport (375×812, touch emulation): tap a tile; same landing behaviour.
- **Done when**: on Fast 4G with cache disabled, 5 of 5 un-hovered opens land the morph on the photo's final bounds.
