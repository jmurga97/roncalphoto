# 007 — Recompute the studio origin on every fresh opening

- **Status**: DONE
- **Commit**: 2fb5827 (audited working tree, including uncommitted studio files)
- **Severity**: HIGH
- **Category**: Physicality & origin / interruptibility
- **Estimated scope**: 1 source file, approximately 15 lines
- **Depends on**: None

## Problem

The studio is a native modal dialog that expands visually from the floating sidebar. After closing,
the effect retains the last computed `clip-path`. A fresh opening uses that retained value even if
the viewport and sidebar have changed. This was reproduced in Chromium: open and close at 1440 × 960,
resize to 390 × 844, open the mobile menu, and open the studio. Its first keyframe still contains
`inset(60px 1033.61px 0px 0px round 17.6px)`, although the new dialog is only 358px wide.

Current source: `/Users/murgapja/dev/roncalphoto/apps/photos/src/components/studio/studio-panel.tsx:25`:

```tsx
const currentClip = getComputedStyle(dialog).clipPath;
if (isOpen && !dialog.open) {
  dialog.showModal();
  dialog.scrollTop = 0;
}
```

At lines 37–38:

```tsx
const restingClip = isOpen ? collapsed : expanded;
const initialClip = currentClip === "none" ? restingClip : currentClip;
```

Cleanup at lines 56–62 saves the computed shape before canceling the animation, which is necessary
for an interrupted opening. The defect is treating that shape as valid for subsequent visits.

## Target

- Every fresh opening starts at the sidebar's **current** rectangle.
- Closing an opening that is still running continues from its current frame.
- Keep the existing 280ms shape animation and 160ms content fade. Keep the exact existing
  `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` token.
- Text still begins fading in only after expansion. Under reduced motion, shape duration stays 0.

Record whether this is a fresh opening **before** `showModal()` changes `dialog.open`:

```tsx
const isFreshOpen = isOpen && !dialog.open;
const currentClip = getComputedStyle(dialog).clipPath;
if (isFreshOpen) {
  dialog.style.removeProperty("clip-path");
  dialog.showModal();
  dialog.scrollTop = 0;
}
```

After measuring the current sidebar and dialog rectangles and computing `collapsed` and `expanded`:

```tsx
const restingClip = isOpen ? collapsed : expanded;
const initialClip = isFreshOpen || currentClip === "none" ? restingClip : currentClip;
```

Do not remove the existing cleanup that preserves the current frame during interruption.

## Repo conventions to follow

- The implementation lives in
  `/Users/murgapja/dev/roncalphoto/apps/photos/src/components/studio/studio-panel.tsx`.
- `/Users/murgapja/dev/roncalphoto/apps/photos/src/app/styles/tokens.css:77` owns `--ease-out`.
  Read its computed value as the component already does; do not duplicate the cubic-bezier in JS.
- Reuse `/Users/murgapja/dev/roncalphoto/apps/photos/src/utils/prefers-reduced-motion.ts`.
- Preserve native `showModal()`, `cancel`, focus restoration, and keyboard propagation protection.
- The repository already contains unrelated work. Preserve it. Do not add test files for this refactor.

## Steps

1. In `studio-panel.tsx`, introduce `isFreshOpen` and the opening block shown above. Ensure the flag
   is computed before calling `showModal()`.
2. Change only the `initialClip` expression to the target above. Measure both rectangles afresh;
   never use a cached sidebar rectangle or a cached viewport size.
3. Keep the existing animation cancellation and completion behavior. Plan 009 handles close timing;
   do not combine that change into this plan.
4. Verify resize/reopen and interrupted opening. No new dependency, reusable animation controller,
   resize subscription, or store state is necessary for this fix.

## Boundaries

- Do NOT edit studio copy, SEO, routes, gallery motion, or sidebar behavior.
- Do NOT add an event listener for every viewport resize: measure on each opening instead.
- Do NOT remove native dialog behavior or the delayed content reveal.
- If the quoted code differs beyond formatting, or another implementation has replaced clipping,
  stop and report the drift. Do not reintroduce clipping after plan 008 has replaced it.

## Verification

- **Mechanical**, from `/Users/murgapja/dev/roncalphoto`: `bun run check`, `bun run lint`,
  `bun run build`, and the existing `bun run test:e2e` must pass. Add no test files.
- **Browser**: use the existing public Vite server, or start it with
  `bun run --cwd apps/photos dev`. The UI uses read-only demo fixtures at
  `http://localhost:5174/?data=demo`; do not start production API writes.
- **Reproduction**: open and close the studio at 1440 × 960, resize to 390 × 844, open the menu,
  then open the studio. Inspect `dialog.getAnimations()[0].effect.getKeyframes()` from DevTools.
  The first keyframe must match the current mobile card. Repeat mobile → desktop and portrait → landscape.
  The development-data toolbar can overlap the mobile menu button; hide that toolbar in DevTools for
  this check, without changing product source.
- **Feel check**: set animation playback to 10% in DevTools. The first visible frame must sit on
  the current sidebar, with no initial empty interval caused by an out-of-bounds clip.
- Press Escape midway through expansion. Closing must begin at the current shape, not the final
  full-size shape. Reopen after closing; repeat at both breakpoints and with reduced motion.
- **Done when**: reopening uses fresh geometry, interrupted closing remains continuous, and the
  content still appears only after the expansion has completed.

## Implementation verification

Implemented in the working tree. `bun run check`, `bun run lint`, `bun run build`, and all 19 existing
Playwright tests passed. A scratch browser check (no new repository test files) confirmed exact
sidebar-origin bounds after desktop/mobile/tablet resizing, uninterrupted geometry on mid-opening
Escape, a modal still open at 80ms of reduced-motion close, scroll reset, sticky close control,
light/dark fill alpha, no horizontal overflow, and zero axe violations or browser errors.
Physical-device frame pacing remains unmeasured.
