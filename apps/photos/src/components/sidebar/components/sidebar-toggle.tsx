import { useSidebarActions, useSidebarOpen } from "@app/store";
import { SIDEBAR_TOGGLE_ID } from "../utils/sidebar-dom";

export function SidebarToggle() {
  const isOpen = useSidebarOpen();
  const { toggleSidebar } = useSidebarActions();

  return (
    <button
      id={SIDEBAR_TOGGLE_ID}
      type="button"
      className="fixed top-4 right-4 z-50 rounded-full border ui-divider p-3 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none"
      data-sidebar-toggle="true"
      style={{
        background: "color-mix(in srgb, var(--color-surface) 76%, transparent)",
        color: "var(--color-text)",
      }}
      aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      aria-expanded={isOpen}
      aria-controls="photos-sidebar"
      onClick={toggleSidebar}
    >
      <svg
        className={["sidebar-toggle-icon h-5 w-5", isOpen ? "is-open" : ""].join(" ")}
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line
          className="sidebar-toggle-line sidebar-toggle-line-top"
          x1="4"
          y1="6"
          x2="20"
          y2="6"
        />
        <line
          className="sidebar-toggle-line sidebar-toggle-line-middle"
          x1="4"
          y1="12"
          x2="20"
          y2="12"
        />
        <line
          className="sidebar-toggle-line sidebar-toggle-line-bottom"
          x1="4"
          y1="18"
          x2="20"
          y2="18"
        />
      </svg>
    </button>
  );
}
