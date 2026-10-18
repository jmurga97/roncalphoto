# 008 — Grow the studio surface and its edges together

- **Status**: DONE
- **Commit**: 2fb5827 (audited working tree, including uncommitted studio files)
- **Severity**: MEDIUM
- **Category**: Physicality & origin / cohesion
- **Estimated scope**: 3 source files, approximately 80–120 changed lines
- **Depends on**: 007 and 009; run last because this replaces the shape-animation implementation

## Problem

Opening the studio hides the sidebar and shows a viewport-sized dialog whose visible area is
animated with `clip-path`. Its glass fill changes immediately, and its real border and shadow remain
on the outer dialog rectangle rather than on the moving clipped edge. It reads as a reveal rather
than the same floating card growing.

Confirmed in Chromium at 1440 × 960: the sidebar background has alpha 0.62; the studio has alpha
0.94 from its very first frame, before expansion or text reveal.

Current source: `/Users/murgapja/dev/roncalphoto/apps/photos/src/components/studio/studio-panel.tsx:39`:

```tsx
const morph = dialog.animate(
  { clipPath: [initialClip, isOpen ? expanded : collapsed] },
  { duration, easing, fill: "both" },
);
```

`/Users/murgapja/dev/roncalphoto/apps/photos/src/app/styles/sidebar.css:98`:

```css
border-radius: var(--radius-lg);
color: var(--color-text);
background-color: color-mix(in srgb, var(--color-surface) 94%, transparent);
```

`/Users/murgapja/dev/roncalphoto/apps/photos/src/app/styles/sidebar.css:111`:

```css
body:has(.studio-panel[open]) :is(.sidebar-card, .sidebar-pill) {
  visibility: hidden;
}
```

## Target

Use one WAAPI transform on the **dialog surface itself**, with its content invisible during travel.
This makes the real glass border and shadow travel with its bounds. Fade a separate background-fill
element from the sidebar's actual glass alpha to 0.94 over that same interval. Keep the native modal
dialog, existing final floating margins, both themes, and all studio copy.

Exact timing:

- Surface transform: **280ms**, using the existing
  `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`.
- Background alpha: the same 280ms and curve, 0.62 → 0.94 in light, 0.58 → 0.94 in dark.
- Studio content opacity: **160ms**, same curve, beginning only after the 280ms expansion.
- Reduced motion: no position or scale change, no travel delay; keep the 160ms opacity transition.
- Closing: fade text out for **160ms first**, then reverse surface geometry and background alpha
  over **280ms**. Give the geometry and fill animations a 160ms delay on normal-motion close, so
  readable text never scales. Reduced-motion close has no geometry delay or movement and retains
  only the 160ms content fade. Wait for **all** owned animations before `dialog.close()`, preserving
  the fix from plan 009. The deliberate normal-motion close lasts 440ms in total.

This is a surface transform; do not show scaled text. Do not animate layout properties, shadows,
border widths, filter radius, or body text positions. Rounded corners scale with the surface; check
their appearance in slow motion rather than adding per-frame radius compensation or a spring engine.

## Repo conventions to follow

All paths below are absolute:

- Component: `/Users/murgapja/dev/roncalphoto/apps/photos/src/components/studio/studio-panel.tsx`.
- Studio rules: `/Users/murgapja/dev/roncalphoto/apps/photos/src/app/styles/sidebar.css`.
- Shared tokens: `/Users/murgapja/dev/roncalphoto/apps/photos/src/app/styles/tokens.css`.
- Existing `.glass` in `/Users/murgapja/dev/roncalphoto/apps/photos/src/app/styles/base.css:69`
  already supplies the border, shadow, and 12px backdrop filter. Keep that shared rule untouched.
- The current component reads `--ease-out` through `getComputedStyle` and uses
  `/Users/murgapja/dev/roncalphoto/apps/photos/src/utils/prefers-reduced-motion.ts`; reuse both.
- No dependencies, tests, new public API, or changes to the session-gallery view transitions.

## Steps

1. **Expose the existing glass alpha as a token.** In `tokens.css`, introduce
   `--glass-opacity: 0.62` in light and `--glass-opacity: 0.58` in dark. Express the existing
   `--glass-bg` values as follows so sidebar and studio cannot diverge:

   ```css
   --glass-bg: color-mix(in srgb, var(--color-surface) calc(var(--glass-opacity) * 100%), transparent);
   ```

   Add theme-independent `--studio-surface-opacity: 0.94`. These values preserve the existing
   static appearance; do not change colors or the final studio alpha.

2. **Separate fill from readable content.** In `studio-panel.tsx`, add a single
   `backgroundRef = useRef<HTMLDivElement>(null)` and insert this before `.studio-panel-content`:

   ```tsx
   <div aria-hidden="true" className="studio-panel-background" ref={backgroundRef} />
   ```

   In `sidebar.css`, replace the studio's current background override and scrolling ownership:

   ```css
   .studio-panel {
     /* Retain the existing fixed inset, size, margin, padding, radius and color rules. */
     overflow: hidden;
     background-color: transparent;
     transform-origin: 0 0;
     isolation: isolate;
   }

   .studio-panel-background {
     position: absolute;
     inset: 0;
     border-radius: inherit;
     background-color: var(--color-surface);
     opacity: var(--glass-opacity);
     pointer-events: none;
   }

   .studio-panel-content {
     position: relative;
     height: 100%;
     overflow-y: auto;
     overscroll-behavior: contain;
     opacity: 0;
   }
   ```

   Keep `.glass` on the native dialog so the border and shadow are on the transformed element.
   Change the fresh-opening scroll reset to `content.scrollTop = 0`; the close toolbar must remain
   sticky in this scroll container. Do not change its label, events, or focus semantics.

3. **Replace clipping with measured transforms.** Preserve plan 007's `isFreshOpen` logic. Before
   measuring, capture the current computed transform for an interrupted transition, then temporarily
   set the dialog's transform to `none` to measure its final untransformed rectangle. If an existing
   owned morph is filling a transform, temporarily cancel that owned animation only after capturing
   its computed frame; do not cancel unrelated document animations. Perform the reads/writes in the
   same effect before paint, not in an animation-frame loop.

   Measure `origin = sidebar.getBoundingClientRect()` and `target = dialog.getBoundingClientRect()`.
   With nonzero target dimensions, derive:

   ```tsx
   const collapsed = `translate(${origin.left - target.left}px, ${origin.top - target.top}px) scale(${origin.width / target.width}, ${origin.height / target.height})`;
   const expanded = "translate(0px, 0px) scale(1, 1)";
   ```

   Animate the full `transform` string with WAAPI. On a fresh opening always start from the newly
   measured collapsed transform. When reversing an active opening, start from its captured computed
   matrix. For reduced motion use `expanded` at both ends: a duration-zero transform must not leave
   the dialog collapsed during the content's closing fade.

   Remove the `clipPath` animation, clipped-shape construction, and inline clip preservation. Keep
   exactly one owned morph; use a component ref for it if necessary to distinguish it from a finished
   fill and to measure without its transform influencing the target rectangle.

4. **Animate the fill with the geometry.** Read the numeric `--glass-opacity` and
   `--studio-surface-opacity` tokens from computed styles. Animate `backgroundRef.current` opacity
   from glass to studio alpha when opening, and from its current computed alpha back to glass when
   closing. On a fresh opening reset to the current theme's glass alpha; do not reuse an old theme's
   alpha. This fill transition shares the morph duration and curve. Under reduced motion, use the
   final studio alpha immediately and omit fill travel. On normal-motion close, the fill and shape
   animations both have a 160ms delay while text fades; on opening they both have zero delay.

5. **Preserve lifecycle guarantees.** Keep the 160ms text fade delayed until expansion finishes.
   On closing, fade text immediately and delay shape/fill by 160ms, except under reduced motion.
   Include morph, fill, and content animations in `Promise.all([...finished])` before closing. On
   cleanup, preserve current transform, fill alpha, and content opacity before canceling only the
   owned animations. On a new completed visit ignore cached geometry, as specified in plan 007.
   Preserve the cancellation catch so an interrupted old callback cannot close the new dialog.

6. Retain the existing sidebar visibility handoff during the modal lifetime. At the collapsed end,
   the dialog's fill alpha and bounds must match the sidebar before native close restores it. Do not
   crossfade two blurred surfaces or keep an invisible modal blocking the portfolio after completion.

## Boundaries

- Edit only the three source files named above. Keep `StudioContent`, SEO, Worker responses, routes,
  sidebar menu contents, and session-gallery animation behavior unchanged.
- Do NOT add Framer Motion, View Transition orchestration, a reusable controller, or a rAF loop.
- Do NOT increase the existing blur radius or claim GPU/frame-rate improvements without measuring.
- Do NOT add stagger, button feedback, or other optional audit ideas; these were not selected.
- Expected prerequisite differences: plan 007 adds fresh-opening geometry handling; plan 009 waits
  for content completion. Preserve both. If the source has drifted beyond those changes, stop and
  report the mismatch rather than overwriting other work.

## Verification

- **Mechanical**, from `/Users/murgapja/dev/roncalphoto`: `bun run check`, `bun run lint`,
  `bun run build`, and existing `bun run test:e2e`, all passing. Add no test files.
- **Browser**: use `http://localhost:5174/?data=demo` with the existing server, or start only the public
  Vite app with `bun run --cwd apps/photos dev`. Do not write to production APIs.
- At 1440 × 960, 768 × 1024, and 390 × 844, open and close normally, close during expansion with
  Escape, scroll to the end and close using the sticky toolbar, then reopen. Repeat in both themes.
- **Frame-by-frame feel check**: DevTools playback at 10%. At the start, the visible surface must sit
  on the sidebar; the background must begin at its glass alpha. The right edge, border, and shadow
  must move with the surface rather than stay on the final viewport rectangle. No text may stretch
  or appear before expansion ends. Inspect corners and reject a visible handoff flash.
- Inspect owned WAAPI keyframes: geometry uses `transform`; fill and text use `opacity`; no layout,
  shadow, filter, or font-size animation is present. Check a real mobile device for dropped frames;
  the existing live backdrop blur remains a performance consideration, not a verified regression.
- Repeat desktop → mobile reopen from plan 007 and reduced-motion close from plan 009. With reduced
  motion there must be no translation or scaling, but closing must preserve the content fade and
  restore focus only when it ends. Tab remains inside the native modal while it is open.
- **Done when**: all three selected audit findings remain fixed, static design is retained, and
  start/end frames and moving edges read as one continuous floating surface.

## Implementation verification

Implemented in the working tree. `bun run check`, `bun run lint`, `bun run build`, and all 19 existing
Playwright tests passed. A scratch browser check (no new repository test files) confirmed exact
sidebar-origin bounds after desktop/mobile/tablet resizing, uninterrupted geometry on mid-opening
Escape, a modal still open at 80ms of reduced-motion close, scroll reset, sticky close control,
light/dark fill alpha, no horizontal overflow, and zero axe violations or browser errors.
Physical-device frame pacing remains unmeasured.

Closing during the initial expansion skips the 160ms pre-shrink delay when content is already
fully transparent; this avoids waiting for an invisible fade while preserving text-first closing
whenever content is visible.
