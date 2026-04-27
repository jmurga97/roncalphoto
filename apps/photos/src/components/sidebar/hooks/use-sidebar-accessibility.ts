import { useSidebarActions, useSidebarMobile, useSidebarOpen } from "@app/store";
import { isEditableTarget } from "@utils/is-editable-target";
import type { RefObject } from "react";
import { useEffect, useEffectEvent, useRef } from "react";
import { focusSidebarTarget, focusSidebarToggle } from "../utils/sidebar-dom";

interface UseSidebarAccessibilityOptions {
  sidebarRef: RefObject<HTMLElement | null>;
}

export function useSidebarAccessibility({ sidebarRef }: UseSidebarAccessibilityOptions) {
  const isMobile = useSidebarMobile();
  const isSidebarOpen = useSidebarOpen();
  const { closeSidebar } = useSidebarActions();
  const restoreToggleFocusRef = useRef(false);

  const handleKeydown = useEffectEvent((event: KeyboardEvent) => {
    if (isEditableTarget(event.target)) {
      return;
    }

    if (event.key === "Escape" && isMobile && isSidebarOpen) {
      restoreToggleFocusRef.current = true;
      closeSidebar();
    }
  });

  useEffect(() => {
    const onDocumentKeydown = (event: KeyboardEvent) => {
      handleKeydown(event);
    };

    document.addEventListener("keydown", onDocumentKeydown);

    return () => {
      document.removeEventListener("keydown", onDocumentKeydown);
    };
  }, [handleKeydown]);

  useEffect(() => {
    if (!isMobile || !isSidebarOpen) {
      return;
    }

    focusSidebarTarget(sidebarRef.current);
  }, [isMobile, isSidebarOpen, sidebarRef]);

  useEffect(() => {
    if (!isMobile || isSidebarOpen || !restoreToggleFocusRef.current) {
      return;
    }

    focusSidebarToggle();
    restoreToggleFocusRef.current = false;
  }, [isMobile, isSidebarOpen]);
}
