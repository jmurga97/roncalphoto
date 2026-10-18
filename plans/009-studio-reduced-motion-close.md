# 009 — Let the studio closing fade finish under reduced motion

- **Status**: DONE
- **Commit**: 2fb5827 (audited working tree, including uncommitted studio files)
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 source file, approximately 5 lines
- **Depends on**: None; execute after 007 and before 008 to avoid editing the same effect concurrently

## Problem

The studio correctly removes geometry travel for reduced motion, but native close is scheduled only
after the geometry animation finishes. That animation lasts zero milliseconds under reduced motion,
so `dialog.close()` hides the content before its existing 160ms opacity fade can play.

Reproduced in Chromium with `reducedMotion: "reduce"`: immediately after Escape, `dialog.open` is
false while the content opacity animation is still at `currentTime: 0`.

Current source: `/Users/murgapja/dev/roncalphoto/apps/photos/src/components/studio/studio-panel.tsx:35`:

```tsx
const duration = prefersReducedMotion() ? 0 : 280;
```

At lines 43–54:

```tsx
const reveal = content.animate(
  { opacity: isOpen ? ["0", "1"] : [getComputedStyle(content).opacity, "0"] },
  { duration: 160, delay: isOpen ? duration : 0, easing, fill: "both" },
);

void morph.finished
  .then(() => {
    if (!isOpen) dialog.close();
  })
  .catch(() => {
    /* An interrupted transition continues from its current shape. */
  });
```

## Target

Wait for the owned geometry **and** content animations before closing the native dialog:

```tsx
void Promise.all([morph.finished, reveal.finished])
  .then(() => {
    if (!isOpen) dialog.close();
  })
  .catch(() => {
    /* An interrupted transition continues from its current shape. */
  });
```

Keep geometry duration 0 under reduced motion and content duration 160ms with zero closing delay.
Reuse the existing `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`. Do not add a timeout or change the
normal opening sequence: 280ms expansion followed by a 160ms text fade.

The native modal must remain open during the closing fade so focus containment and background
inertness remain effective. Restore the sidebar and original trigger focus only after completion.

## Repo conventions to follow

- Edit `/Users/murgapja/dev/roncalphoto/apps/photos/src/components/studio/studio-panel.tsx` only.
- Use the existing WAAPI `finished` promises, not a new timer or React phase state.
- `/Users/murgapja/dev/roncalphoto/apps/photos/src/utils/prefers-reduced-motion.ts` already detects
  the preference; `/Users/murgapja/dev/roncalphoto/apps/photos/src/app/styles/tokens.css:77` owns easing.
- Keep cleanup cancellation and its rejection handler. A canceled older animation must never close
  an interrupted/reopened dialog through a stale completion callback.
- No test files for this refactor; exercise the UI and existing checks instead.

## Steps

1. Replace `void morph.finished` with `void Promise.all([morph.finished, reveal.finished])` in the
   completion block. Keep the conditional native close and the cancellation catch.
2. Keep both existing animation cancellations in cleanup. Do not catch and resolve individual
   `finished` promises before `Promise.all`, because cancellation must prevent stale native close.
3. Verify both reduced and normal motion. This plan changes completion timing only; plan 007 handles
   stale coordinates, and plan 008 later replaces clipping while preserving this completion rule.

## Boundaries

- Do NOT disable the content fade or add movement for reduced-motion users.
- Do NOT change native modal semantics, copy, styling, geometry, or focus management.
- Do NOT edit the photo stage's separate reduced-motion rules.
- Expected prerequisite difference: plan 007 adds fresh-opening origin handling. If other motion
  logic has changed, stop and report the drift instead of restoring this older implementation.

## Verification

- **Mechanical**, from `/Users/murgapja/dev/roncalphoto`: `bun run check`, `bun run lint`,
  `bun run build`, and existing `bun run test:e2e`, all clean. Add no test files.
- **Browser**: use the existing public Vite server at `http://localhost:5174/?data=demo`, or start it
  with `bun run --cwd apps/photos dev` without starting production API writes.
- Enable reduced motion in DevTools Rendering. Open the studio and let the content become visible.
  Close with the button and repeat with Escape. In slow playback at 10%, confirm that content opacity
  fades to zero while the modal remains open, then native close restores the sidebar and focus.
- **Timing assertion**: pause the content's closing WAAPI animation at 80ms. `dialog.open` must
  still be true. Finish the animation; native close must occur after the completion microtask.
  Under reduced motion no geometry movement may be visible.
- Turn reduced motion off. Closing must still wait for the normal 280ms geometry animation, and
  opening must reveal text only after expansion. Close during the opening reveal to check cancellation.
- **Done when**: reduced-motion close keeps its 160ms opacity feedback, stale callbacks cannot
  close a newer state, and normal-motion choreography remains unchanged.

## Implementation verification

Implemented in the working tree. `bun run check`, `bun run lint`, `bun run build`, and all 19 existing
Playwright tests passed. A scratch browser check (no new repository test files) confirmed exact
sidebar-origin bounds after desktop/mobile/tablet resizing, uninterrupted geometry on mid-opening
Escape, a modal still open at 80ms of reduced-motion close, scroll reset, sticky close control,
light/dark fill alpha, no horizontal overflow, and zero axe violations or browser errors.
Physical-device frame pacing remains unmeasured.
