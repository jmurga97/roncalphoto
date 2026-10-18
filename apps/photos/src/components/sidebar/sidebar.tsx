import { useEffect, useRef, useState } from "react";

import { useSidebarActions, useSidebarMobile } from "@app/store";
import { StudioPanel } from "@components/studio/studio-panel";
import { studioSectionFromHash } from "@components/studio/studio-sections";

import { SidebarOverlay } from "./components/sidebar-overlay";
import { SidebarPanel } from "./components/sidebar-panel";
import { SidebarToggle } from "./components/sidebar-toggle";
import { useSidebarAccessibility } from "./hooks/use-sidebar-accessibility";

import type { StudioSection } from "@components/studio/studio-sections";

export function Sidebar() {
  const sidebarRef = useRef<HTMLElement>(null);
  const [studioSection, setStudioSection] = useState<StudioSection>(
    () => studioSectionFromHash(window.location.hash) ?? "sobre-mi",
  );
  const [isStudioOpen, setStudioOpen] = useState(
    () => window.location.hash === "#estudio" || studioSectionFromHash(window.location.hash) !== undefined,
  );
  const isMobile = useSidebarMobile();
  const { resetMobileSidebarState } = useSidebarActions();

  useEffect(() => {
    if (isMobile) {
      return;
    }

    resetMobileSidebarState();
  }, [isMobile, resetMobileSidebarState]);

  useSidebarAccessibility({ sidebarRef });

  function openStudio(section: StudioSection) {
    setStudioSection(section);
    setStudioOpen(true);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${section}`);
  }

  function closeStudio() {
    setStudioOpen(false);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }

  return (
    <>
      <SidebarToggle />
      <SidebarOverlay />
      <SidebarPanel sidebarRef={sidebarRef} onOpenStudio={openStudio} />
      <StudioPanel
        isOpen={isStudioOpen}
        section={studioSection}
        onClose={closeStudio}
        onSectionChange={openStudio}
        sidebarRef={sidebarRef}
      />
    </>
  );
}
