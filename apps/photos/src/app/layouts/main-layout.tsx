import { ViewTransition } from "react";

import { useSidebarMobile, useSidebarOpen } from "@app/store";
import { Sidebar } from "@components/sidebar/sidebar";
import { STAGE_TRANSITION_CLASSES } from "@utils/view-transitions";

import type { ReactNode } from "react";

export function MainLayout({ children }: { children: ReactNode }) {
  const isSidebarOpen = useSidebarOpen();
  const isMobile = useSidebarMobile();
  const isSidebarDesktopOpen = isSidebarOpen && !isMobile;

  return (
    <ViewTransition default="none" update={STAGE_TRANSITION_CLASSES}>
      <div className="flex h-full">
        <Sidebar />
        <main
          className="photo-stage relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[color:color-mix(in_srgb,var(--color-bg)_84%,#000_16%)]"
          data-sidebar-desktop-open={isSidebarDesktopOpen ? "true" : "false"}
        >
          {children}
        </main>
      </div>
    </ViewTransition>
  );
}
