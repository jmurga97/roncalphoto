import type { ReactNode } from "react";

// ResourceTable also activates rows for keyboard events from nested controls.
// Keep their events within the control, including menus rendered in portals.
export function RowControls({ children }: { children: ReactNode }) {
  return (
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- contains interactive controls and only isolates their events.
    <div onKeyDown={(event) => event.stopPropagation()}>{children}</div>
  );
}
