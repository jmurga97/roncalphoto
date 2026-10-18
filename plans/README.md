# Animation plans — portfolio and studio

Written by `improve-animations` at commit `2fb5827`. Each plan is self-contained and can be run by any agent;
each one ends with a feel check that a human should do in the browser.

The original canvas audit aimed to make opening a photo, moving through the session, and closing back feel
like **one continuous motion**. Plans 001–006 are marked DONE. Plans 007–009 cover the new studio animation.

| #   | Plan                                                                           | Severity | Status | Depends on           |
| --- | ------------------------------------------------------------------------------ | -------- | ------ | -------------------- |
| 001 | [Run the stage on one clock](001-stage-one-clock-crossfade.md)                 | HIGH     | DONE   | —                    |
| 002 | [Morph lands on a loaded photo](002-morph-lands-on-loaded-photo.md)            | HIGH     | DONE   | —                    |
| 003 | [Close always returns to the tile](003-close-always-returns-to-tile.md)        | MEDIUM   | DONE   | —                    |
| 004 | [Reduced motion: gentle crossfade](004-reduced-motion-gentle-crossfade.md)     | LOW      | DONE   | 001                  |
| 005 | [Next-session swap transition](005-next-session-swap-transition.md)            | LOW      | DONE   | 001 (after 004, 006) |
| 006 | [Session details in the main sidebar](006-session-details-in-main-sidebar.md)  | MEDIUM   | DONE   | 001                  |
| 007 | [Recompute the studio origin](007-studio-fresh-origin.md)                      | HIGH     | DONE   | —                    |
| 008 | [Grow the studio surface and edges together](008-studio-continuous-surface.md) | MEDIUM   | DONE   | 007, 009             |
| 009 | [Complete the reduced-motion studio fade](009-studio-reduced-motion-close.md)  | MEDIUM   | DONE   | —                    |

## Studio: recommended execution order

The studio audit was confirmed against the working tree at `2fb5827`, including the uncommitted
`apps/photos/src/components/studio/` implementation. The commit alone does not contain that implementation;
an executor must include the current working-tree files rather than start from a clean checkout of HEAD.

Implemented in order **007 → 009 → 008**:

1. **007** fixes the stale origin after viewport changes, preserving interrupted motion.
2. **009** makes native close wait for the content fade under reduced motion.
3. **008** replaces the clipped reveal with a transforming surface and gradual glass-opacity change,
   preserving the fixes from 007 and 009. It shares `studio-panel.tsx` with both plans, so do not run them in parallel.

All three plans preserve the requested sequence: expand the floating sidebar first, reveal text afterwards.
No plan adds the optional stagger or button-press effects. No new tests, dependencies, or deployments are requested.
Verification passed: `bun run check`, `bun run lint`, `bun run build`, and the 19 existing tests.
Scratch browser checks confirmed resize/reopen origin, mid-opening interruption, reduced-motion close,
light/dark rendering, sticky close, scroll reset, no overflow, and no axe violations or browser errors.
No new test files were added. Physical-device frame pacing remains unmeasured.

## Canvas ↔ session stage: original goal and recommended order

1. **001**: the main fix. A single root crossfade plus the morph share `--ease-out`, at 420ms to open and 340ms to
   close. This alone fixes the "not one flow" feeling.
2. **006**: on desktop the stage's right panel goes away. The session details take over the main sidebar card in
   place (session list ⇄ details crossfade on 001's clock), and opening from the session list animates too. Mobile is
   unchanged.
3. **002**: makes the morph land on the photo's real bounds instead of shrinking into a point, especially on touch
   and slow networks. Start with its step 1 check; if the bug doesn't reproduce, skip the plan.
4. **003**: closing after scrolling inside the stage flies the photo back into its tile instead of fading in place.
5. **004**: reduced-motion users get a 200ms fade instead of a cut.
6. **005**: "Siguiente sesión" lifts the current photo away and brings the next one in.

## Overlaps

- 001, 004 and 005 all edit `setPhotoId` in `apps/photos/src/pages/canvas/hooks/use-canvas-view-model.ts` and the
  view-transition block in `apps/photos/src/app/styles/canvas.css`. Run them one after another, in order, never in
  parallel.
- 006 edits `canvas-photo-stage.tsx`, `canvas-photo-info.tsx` and the `.canvas-focus*` rules in `canvas.css` that
  001 touched; 005 later edits `canvas-photo-stage.tsx` again. Keep the order 001 → 006 → … → 005.
- 002 and 003 both edit `apps/photos/src/pages/canvas/canvas-view.tsx` but different functions (`openPhoto` vs
  `closePhoto`). They are safe in either order, but not in parallel in the same checkout.
- 002 and 003 work without 001; their feel checks just look better after it.

## Not planned

- Photo width/height in the data model, which would remove the need for 002's decode wait. That is a schema/API change, not motion.
- Merging the details into the sidebar on mobile (006 keeps the bottom sheet there).
- Focus is lost when the "Siguiente sesión" button unmounts after a swap (noted in 005, accessibility follow-up).
