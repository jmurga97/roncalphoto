import { useSidebarAboutOpen, useSidebarActions } from "@app/store";
import { focusSidebarToggle } from "@components/sidebar/utils/sidebar-dom";
import { isEditableTarget } from "@utils/is-editable-target";
import { useEffect, useEffectEvent, useRef } from "react";
import { AboutPanelContent } from "./components/about-panel-content";
import { AboutPanelShell } from "./components/about-panel-shell";
import { ABOUT_PANEL_ID, ABOUT_PANEL_TITLE_ID, ABOUT_TRIGGER_ID } from "./constants";

function focusAboutTrigger() {
  const trigger = document.getElementById(ABOUT_TRIGGER_ID);

  if (!(trigger instanceof HTMLElement)) {
    return false;
  }

  trigger.focus();
  return true;
}

export function AboutPanel() {
  const isOpen = useSidebarAboutOpen();
  const { closeAbout } = useSidebarActions();
  const panelRef = useRef<HTMLDivElement>(null);
  const shouldRestoreFocusRef = useRef(false);
  const triggerToRestoreRef = useRef<HTMLElement | null>(null);

  const requestClose = useEffectEvent(() => {
    shouldRestoreFocusRef.current = true;
    closeAbout();
  });

  const handleDocumentKeydown = useEffectEvent((event: KeyboardEvent) => {
    if (!isOpen || isEditableTarget(event.target)) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
    }
  });

  useEffect(() => {
    const onDocumentKeydown = (event: KeyboardEvent) => {
      handleDocumentKeydown(event);
    };

    document.addEventListener("keydown", onDocumentKeydown);

    return () => {
      document.removeEventListener("keydown", onDocumentKeydown);
    };
  }, [handleDocumentKeydown]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    triggerToRestoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.querySelector<HTMLElement>("[data-about-focus-target]")?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || !shouldRestoreFocusRef.current) {
      return;
    }

    const trigger = triggerToRestoreRef.current;

    if (trigger?.isConnected) {
      trigger.focus();
    } else {
      const hasFocusedTrigger = focusAboutTrigger();

      if (!hasFocusedTrigger) {
        focusSidebarToggle();
      }
    }

    shouldRestoreFocusRef.current = false;
    triggerToRestoreRef.current = null;
  }, [isOpen]);

  return (
    <AboutPanelShell
      isOpen={isOpen}
      onClose={requestClose}
      panelId={ABOUT_PANEL_ID}
      panelRef={panelRef}
      titleId={ABOUT_PANEL_TITLE_ID}
    >
      <div>
        <AboutPanelContent titleId={ABOUT_PANEL_TITLE_ID} />
      </div>
    </AboutPanelShell>
  );
}
