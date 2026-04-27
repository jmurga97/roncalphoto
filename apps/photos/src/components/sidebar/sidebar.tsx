import { useSidebarActions, useSidebarMobile } from "@app/store";
import { useEffect, useRef } from "react";
import { SidebarOverlay } from "./components/sidebar-overlay";
import { SidebarPanel } from "./components/sidebar-panel";
import { SidebarToggle } from "./components/sidebar-toggle";
import { useSidebarAccessibility } from "./hooks/use-sidebar-accessibility";
import { useSidebarScrollbarWidth } from "./hooks/use-sidebar-scrollbar-width";

export function Sidebar() {
  const sidebarRef = useRef<HTMLElement>(null);
  const isMobile = useSidebarMobile();
  const { resetMobileSidebarState } = useSidebarActions();

  useEffect(() => {
    if (isMobile) {
      return;
    }

    resetMobileSidebarState();
  }, [isMobile, resetMobileSidebarState]);

  useSidebarAccessibility({ sidebarRef });
  useSidebarScrollbarWidth(sidebarRef);

  return (
    <>
      <SidebarToggle />
      <SidebarOverlay />
      <SidebarPanel sidebarRef={sidebarRef} />
    </>
  );
}
