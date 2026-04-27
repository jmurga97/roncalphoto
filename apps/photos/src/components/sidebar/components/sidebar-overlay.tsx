import { useSidebarMobile, useSidebarOpen } from "@app/store";

export function SidebarOverlay() {
  const isMobile = useSidebarMobile();
  const isOpen = useSidebarOpen();
  const isVisible = isMobile && isOpen;

  return (
    <div
      className="sidebar-overlay fixed inset-0 z-30 bg-black/25 backdrop-blur-md md:hidden"
      data-sidebar-open={isVisible ? "true" : "false"}
    />
  );
}
