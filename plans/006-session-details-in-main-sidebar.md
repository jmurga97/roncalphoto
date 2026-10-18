# 006 — Merge the stage's right panel into the main sidebar (desktop)

- **Status**: DONE
- **Commit**: 2fb5827
- **Severity**: MEDIUM (requested by the product owner)
- **Category**: Missed opportunities (spatial continuity) / Cohesion
- **Estimated scope**: 6 files, ~50 lines
- **Depends on**: 001 (root crossfade, `--duration-stage-open`, `--ease-out`). Run right after 001.

## Problem

On desktop the canvas has one floating glass sidebar on the left: brand, tag filter, session list, footer. Opening a
photo mounts the session stage (`.canvas-focus`, `z-index: 60`, `position: fixed; inset: 0`). It covers that
sidebar and brings its **own** glass panel on the right with the session details and thumbnails. The UI context
jumps from left to right, and two different cards do the same job.

```css
/* apps/photos/src/app/styles/canvas.css:133-143 — current (plan 001 changes only the animation line) */
.canvas-focus {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  grid-template-columns: minmax(0, 1fr) min(26rem, 34vw);
  …
}
```

```tsx
// apps/photos/src/pages/canvas/components/canvas-photo-stage.tsx:90-131 — current
  return (
    <div
      aria-label={`Sesión ${session.title}`}
      aria-modal="true"
      className="canvas-focus"
      data-immersive={isImmersive && isMobile ? "true" : undefined}
      role="dialog"
    >
      <div className="canvas-focus-gallery" …>
        <GalleryView … thumbnailsTarget={thumbnailsTarget} transitionPhotoId={selectedPhotoId} />
      </div>

      {photo ? (
        <CanvasPhotoInfo
          nextSession={nextSession}
          onClose={onClose}
          onOpenSession={onSelectPhoto}
          photo={photo}
          position={index + 1}
          session={session}
          thumbnailsRef={setThumbnailsTarget}
        />
      ) : null}
    </div>
  );
```

```tsx
// apps/photos/src/pages/canvas/components/canvas-photo-info.tsx:48-49 — current
  return (
    <aside className="canvas-focus-info glass" data-expanded={isExpanded ? "true" : undefined}>
```

```tsx
// apps/photos/src/components/sidebar/components/sidebar-panel.tsx:31-36 — current
<div className="flex min-h-full flex-col px-5 py-6 md:px-6">
  <SidebarHeader />
  <SidebarTagFilter />
  <SidebarNavigationMenu />
  <SidebarFooter />
</div>
```

Opening a session from the sidebar list is a hard cut. The link sets `photo`, which opens the stage, with no view
transition:

```tsx
// apps/photos/src/components/sidebar/components/sidebar-item.tsx:50-51 — current
        search={item.isActive ? {} : { photo: item.firstPhotoId, session: item.slug }}
        to="/"
```

## Target

**Desktop (≥768px):**

- The main sidebar card stays on screen above the stage's blurred backdrop. While a session is open, its home
  content (header, tag filter, session list, footer) is replaced **in place** by the session details: title, tags,
  description, photo block, "Siguiente sesión", and the thumbnail grid at the bottom.
- The gallery fills the area to the right of the sidebar. If the user has closed the sidebar with the pill, the
  gallery uses the full width and the details are one pill-click away.
- **Transition**: the card itself never moves or resizes. Plan 001's root crossfade (420ms open / 340ms close,
  `cubic-bezier(0.23, 1, 0.32, 1)`) fades its content list → details while the backdrop fades in and the tile morphs
  into the gallery. Closing reverses it: details → session list. The list's hover highlight (dimming the canvas) is
  unchanged.
- Opening a session from the sidebar list uses the same view transition (`stage-open`).

**Mobile (<768px): unchanged.** The details stay in the stage's own bottom sheet. The mobile sidebar is a closed
sheet behind the pill, so it isn't a place where a session is being read.

Mechanism (no new state): the stage **portals** `CanvasPhotoInfo` into an empty slot inside the sidebar card. A
CSS `:has()` rule hides the home content while the slot has children. All session logic (close, next session,
thumbnails, camera) stays in the canvas page.

## Repo conventions to follow

- Layered imports `utils → lib → components → pages`: pages may import components, never the reverse. The slot id
  lives in `apps/photos/src/components/sidebar/constants.ts`. Exemplar: `canvas-photo-info.tsx:4` already imports
  `TAG_CHIP_CLASS` from `@components/sidebar/constants`.
- Portals are already used for the thumbnails: `gallery-grid.tsx:80-87` (`createPortal(…, thumbnailsTarget)`).
- Sidebar styles live in `apps/photos/src/app/styles/sidebar.css`; stage styles in `canvas.css`.
- Stacking today: canvas controls 10–20, mobile sidebar overlay 30, sidebar card 40, pill 50, stage 60, about
  panel 70.

## Steps

1. **components/sidebar/constants.ts**: add

   ```ts
   // The canvas session stage portals its details here on desktop (see CanvasPhotoStage).
   export const SIDEBAR_SESSION_SLOT_ID = "sidebar-session-slot";
   ```

2. **sidebar-panel.tsx**: import `SIDEBAR_SESSION_SLOT_ID` from `"../constants"` and replace lines 31-36 with:

   ```tsx
   <div className="flex min-h-full flex-col px-5 py-6 md:px-6">
     <div className="sidebar-home contents">
       <SidebarHeader />
       <SidebarTagFilter />
       <SidebarNavigationMenu />
       <SidebarFooter />
     </div>
     <div className="sidebar-session-slot flex flex-1 flex-col empty:hidden" id={SIDEBAR_SESSION_SLOT_ID} />
   </div>
   ```

   `contents` keeps `SidebarFooter`'s `mt-auto` working inside the outer flex column.

3. **sidebar.css**: after the `.sidebar-card[data-sidebar-open="true"]` rule, add:

   ```css
   /* An open session takes over the card: the canvas stage portals its details into the slot. */
   .sidebar-card:has(.sidebar-session-slot:not(:empty)) .sidebar-home {
     display: none;
   }
   ```

4. **sidebar-item.tsx**: give the link the stage-open view transition (only when it opens a session). Add this prop
   on `<Link>`, after `search={…}`:

   ```tsx
           viewTransition={item.isActive ? undefined : { types: ["stage-open"] }}
   ```

5. **canvas-photo-info.tsx**: add `className: string;` to `CanvasPhotoInfoProps` (first, alphabetical),
   destructure it, and change line 49 to
   `<aside className={className} data-expanded={isExpanded ? "true" : undefined}>`.

6. **canvas-photo-stage.tsx**:
   - Imports: add `import { createPortal } from "react-dom";` after the `react` import, and
     `import { SIDEBAR_SESSION_SLOT_ID } from "@components/sidebar/constants";` after the `@/pages/gallery` import.
   - After the `isImmersive` state, add:

     ```tsx
     // Desktop: the details take over the main sidebar card (slot in SidebarPanel), rendered there through a portal.
     const [sidebarSlot] = useState(() => document.getElementById(SIDEBAR_SESSION_SLOT_ID));
     const detailsTarget = isMobile ? null : sidebarSlot;
     ```

   - Replace the `{photo ? (<CanvasPhotoInfo … />) : null}` block with a `details` constant built before `return`,
     keeping every existing prop and adding `className`:

     ```tsx
     const details = photo ? (
       <CanvasPhotoInfo
         className={detailsTarget ? "canvas-focus-info" : "canvas-focus-info glass"}
         nextSession={nextSession}
         onClose={onClose}
         onOpenSession={onSelectPhoto}
         photo={photo}
         position={index + 1}
         session={session}
         thumbnailsRef={setThumbnailsTarget}
       />
     ) : null;
     ```

     and render it as the dialog's last child:
     `{detailsTarget && details ? createPortal(details, detailsTarget) : details}`.

   - On the dialog `div`, change `aria-modal="true"` to `aria-modal={detailsTarget ? undefined : "true"}`. On desktop
     the close button lives in the sidebar, outside the dialog's DOM; a modal dialog would hide it from screen readers.

7. **canvas.css** (state after plan 001):
   - `.canvas-focus`: change `grid-template-columns: minmax(0, 1fr) min(26rem, 34vw);` to
     `grid-template-columns: minmax(0, 1fr);` and `z-index: 60;` to `z-index: 35;`. Then, right after the `@supports`
     rule plan 001 added below `.canvas-focus`, add:

     ```css
     /* Desktop: the gallery fills the space right of the open sidebar card, which carries the session details. */
     main[data-sidebar-desktop-open="true"] .canvas-focus {
       padding-left: calc(var(--layout-sidebar-width) + var(--layout-float-gap));
     }
     ```

   - `.canvas-focus-info` base rule: replace it entirely with the in-sidebar layout (no card chrome, no animation;
     the root crossfade fades it):

     ```css
     .canvas-focus-info {
       display: flex;
       flex: 1;
       flex-direction: column;
       gap: 1.25rem;
     }
     ```

   - Inside the first `@media (max-width: 767px)` block: add `z-index: 60;` to the `.canvas-focus` rule (the stage
     must stay above the mobile pill and sheet). Replace the `.canvas-focus-info` rule with:

     ```css
     .canvas-focus-info {
       gap: 0.85rem;
       max-height: 70dvh;
       overflow-y: auto;
       overscroll-behavior: contain;
       padding: 0.25rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom));
       border-bottom: none;
       border-radius: var(--radius-lg) var(--radius-lg) 0 0;
       animation: canvas-sheet-in var(--duration-stage-open) var(--ease-out) both;
     }
     ```

   - Delete `@keyframes canvas-info-in` (now unused; confirm with
     `grep -rn canvas-info-in apps/photos/src`, which must print nothing).

## Boundaries

- Mobile behaviour must not change: bottom sheet, handle, swipe, immersive tap.
- Do NOT move session logic into `components/sidebar`. The sidebar only provides the slot and the `:has()` rule.
- Do NOT add Zustand state or URL params for "session open"; the slot's children are the signal.
- Do NOT animate `padding-left` or the sidebar card's size or position; the card stays still and only its content
  crossfades.
- Do NOT touch `canvas-view.tsx` (plans 002/003 own it) or the sidebar card's own open/close transition.
- If the sidebar card is not drawn above the stage after step 7, an ancestor is creating a stacking context. STOP and
  report; do not raise z-indexes further.
- If an excerpt doesn't match (drift since 2fb5827 / plan 001), STOP and report.

## Verification

- **Mechanical**: `bun run check`, `bun run lint`, `bun run build`, `bun run test:e2e` (the admin suite; the
  `sidebar-panel` test id must still exist), all clean.
- **Feel check** (`bun run db:seed:local && bun run dev:local`, Chrome, desktop width ≥1280px):
  - Click a canvas tile. The sidebar card stays exactly where it is; its session list crossfades into the session
    details while the backdrop blurs in and the tile morphs into the gallery to the right of the card. It reads as one
    motion with one end.
  - Thumbnails sit at the bottom of the card; clicking one scrolls the gallery to that photo.
  - Close with ✕ (in the card), Escape, or a click beside the photo. The details crossfade back to the session list;
    the list scrolls and hover-dims the canvas exactly as before.
  - Click a session in the list. The stage opens with the same crossfade, not a cut.
  - Close the sidebar with the pill while a session is open: the gallery uses the full width. Reopen it: the details
    are there.
  - At 10% playback: no double image of the card, and the card's glass blur is present during the whole crossfade.
  - Mobile viewport (375×812): identical to before (bottom sheet; the pill is hidden under the stage).
  - Keyboard: after opening, focus is on the ✕ in the card; Tab moves through the card's details.
- **Done when**: on desktop there is exactly one glass panel (the sidebar card) on screen while a session is open,
  and opening and closing crossfade its content in place.
