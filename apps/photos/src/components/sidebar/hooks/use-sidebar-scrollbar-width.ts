import type { RefObject } from "react";
import { useEffect } from "react";
import { SIDEBAR_SCROLL_LIST_SELECTOR } from "../utils/sidebar-dom";

function syncSidebarScrollbarWidth(sidebar: HTMLElement) {
  const menus = sidebar.querySelectorAll<HTMLElement>(SIDEBAR_SCROLL_LIST_SELECTOR);

  for (const menu of menus) {
    const scrollbarWidth = Math.max(menu.offsetWidth - menu.clientWidth, 0);
    menu.style.setProperty("--session-menu-scrollbar-width", `${scrollbarWidth}px`);
  }
}

export function useSidebarScrollbarWidth(sidebarRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const sidebar = sidebarRef.current;

    if (!sidebar) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      syncSidebarScrollbarWidth(sidebar);
    });
    const observeMenus = () => {
      const menus = sidebar.querySelectorAll<HTMLElement>(SIDEBAR_SCROLL_LIST_SELECTOR);

      for (const menu of menus) {
        resizeObserver.observe(menu);
      }

      syncSidebarScrollbarWidth(sidebar);
    };
    const mutationObserver = new MutationObserver(() => {
      resizeObserver.disconnect();
      observeMenus();
    });

    observeMenus();
    mutationObserver.observe(sidebar, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [sidebarRef]);
}
