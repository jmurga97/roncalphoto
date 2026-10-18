import { ViewTransition } from "react";

import { useSidebarOpen, useSidebarMobile } from "@app/store";

import { SIDEBAR_SESSION_SLOT_ID } from "../constants";
import { SidebarFooter } from "./sidebar-footer";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNavigationMenu } from "./sidebar-navigation-menu";
import { SidebarTagFilter } from "./sidebar-tag-filter";

import type { StudioSection } from "@components/studio/studio-sections";
import type { RefObject } from "react";

interface SidebarPanelProps {
  onOpenStudio: (section: StudioSection) => void;
  sidebarRef: RefObject<HTMLElement | null>;
}

/**
 * Floating glass card anchored to the toggle pill: below it on desktop, above
 * it as a bottom sheet on mobile.
 */
export function SidebarPanel({ sidebarRef, onOpenStudio }: SidebarPanelProps) {
  const isOpen = useSidebarOpen();
  const isMobile = useSidebarMobile();

  return (
    <ViewTransition
      default="none"
      update={
        isMobile
          ? "none"
          : {
              "stage-open": "sidebar-card",
              "stage-close": "sidebar-card",
              "stage-swap": "sidebar-card",
              "stage-resize": "sidebar-card",
              default: "none",
            }
      }
    >
      <aside
        id="photos-sidebar"
        ref={sidebarRef}
        aria-label="Panel editorial"
        className="sidebar-card glass"
        data-sidebar-open={isOpen ? "true" : "false"}
        data-testid="sidebar-panel"
        inert={!isOpen}
      >
        <div className="flex min-h-full flex-col px-5 py-6 md:px-6">
          <div className="sidebar-home contents">
            <SidebarHeader />
            <SidebarTagFilter />
            <SidebarNavigationMenu />
            <SidebarFooter onOpenStudio={onOpenStudio} />
          </div>
          <div className="sidebar-session-slot flex flex-1 flex-col empty:hidden" id={SIDEBAR_SESSION_SLOT_ID} />
        </div>
      </aside>
    </ViewTransition>
  );
}
