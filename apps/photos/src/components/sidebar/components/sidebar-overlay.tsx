import { useSidebarActions, useSidebarMobile, useSidebarOpen } from "@app/store";

import { focusSidebarToggle } from "../utils/sidebar-dom";

export function SidebarOverlay() {
  const isMobile = useSidebarMobile();
  const isOpen = useSidebarOpen();
  const isVisible = isMobile && isOpen;
  const { closeSidebar } = useSidebarActions();

  return (
    <button
      type="button"
      aria-hidden={!isVisible}
      aria-label="Cerrar menú"
      className="pointer-events-none fixed inset-0 z-30 appearance-none border-0 bg-black/25 p-0 opacity-0 backdrop-blur-md transition-opacity duration-[280ms] ease-out data-[sidebar-open=true]:pointer-events-auto data-[sidebar-open=true]:opacity-100 md:hidden motion-reduce:transition-none"
      data-sidebar-open={isVisible ? "true" : "false"}
      disabled={!isVisible}
      onClick={() => {
        closeSidebar();
        focusSidebarToggle();
      }}
    />
  );
}
