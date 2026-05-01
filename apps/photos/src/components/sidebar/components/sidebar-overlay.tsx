import { useSidebarMobile, useSidebarOpen } from "@app/store";

export function SidebarOverlay() {
  const isMobile = useSidebarMobile();
  const isOpen = useSidebarOpen();
  const isVisible = isMobile && isOpen;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 bg-black/25 opacity-0 backdrop-blur-md transition-opacity duration-[280ms] ease-out data-[sidebar-open=true]:pointer-events-auto data-[sidebar-open=true]:opacity-100 md:hidden motion-reduce:transition-none"
      data-sidebar-open={isVisible ? "true" : "false"}
    />
  );
}
