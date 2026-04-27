import { useSidebarMobile, useSidebarOpen } from "@app/store";
import type { RefObject } from "react";
import { SidebarFooter } from "./sidebar-footer";
import { SidebarHeader } from "./sidebar-header/sidebar-header";
import { SidebarNavigationMenu } from "./sidebar-navigation-menu";
import { SidebarRelatedSection } from "./sidebar-related-section/sidebar-related-section";

interface SidebarPanelProps {
  sidebarRef: RefObject<HTMLElement | null>;
}

export function SidebarPanel({ sidebarRef }: SidebarPanelProps) {
  const isMobile = useSidebarMobile();
  const isOpen = useSidebarOpen();

  return (
    <aside
      id="photos-sidebar"
      ref={sidebarRef}
      aria-hidden={!isOpen && isMobile}
      aria-label="Panel editorial"
      className="editorial-shell sidebar-panel fixed top-0 left-0 z-40 h-full overflow-y-auto"
      data-sidebar-open={isOpen ? "true" : "false"}
      data-testid="sidebar-panel"
    >
      <div className="flex min-h-full flex-col px-6 py-7 md:px-8 md:py-8">
        <SidebarHeader />
        <SidebarNavigationMenu />
        <SidebarRelatedSection />
        <SidebarFooter />
      </div>
    </aside>
  );
}
