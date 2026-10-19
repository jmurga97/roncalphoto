import { ViewTransition } from "react";

import { useSidebarActions, useSidebarOpen, useSidebarMobile } from "@app/store";

import { SidebarToggleIcon } from "./sidebar-toggle-icon";
import { SIDEBAR_TOGGLE_ID } from "../utils/sidebar-dom";

export function SidebarToggle() {
  const isOpen = useSidebarOpen();
  const isMobile = useSidebarMobile();
  const { toggleSidebar } = useSidebarActions();

  return (
    <ViewTransition
      default="none"
      update={
        isMobile
          ? "none"
          : {
              "stage-open": "sidebar-pill",
              "stage-close": "sidebar-pill",
              "stage-swap": "sidebar-pill",
              "stage-resize": "sidebar-pill",
              default: "none",
            }
      }
    >
      <button
        id={SIDEBAR_TOGGLE_ID}
        type="button"
        className="sidebar-pill glass cursor-pointer"
        data-sidebar-toggle="true"
        // Starts with the visible "MGRE" so voice control users can say what they see.
        aria-label={isOpen ? "MGRE, cerrar menú" : "MGRE, abrir menú"}
        aria-expanded={isOpen}
        aria-controls="photos-sidebar"
        onClick={toggleSidebar}
      >
        <SidebarToggleIcon isOpen={isOpen} />
        <span className="sidebar-pill-label ui-kicker text-[var(--color-text)]">MGRE</span>
      </button>
    </ViewTransition>
  );
}
