export const SIDEBAR_TOGGLE_ID = "sidebar-toggle";
export const SIDEBAR_TOGGLE_SELECTOR = "[data-sidebar-toggle]";
export const SIDEBAR_FOCUS_TARGET_SELECTOR = "[data-sidebar-focus-target]";
export const SIDEBAR_SCROLL_LIST_SELECTOR = "[data-sidebar-scroll-list]";

export function focusSidebarToggle() {
  document.querySelector<HTMLElement>(SIDEBAR_TOGGLE_SELECTOR)?.focus();
}

export function focusSidebarTarget(sidebar: HTMLElement | null) {
  sidebar?.querySelector<HTMLElement>(SIDEBAR_FOCUS_TARGET_SELECTOR)?.focus();
}
