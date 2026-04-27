import { useSidebarMobile, useSidebarOpen } from "@app/store";
import { Sidebar } from "@components/sidebar/sidebar";
import { Outlet } from "@tanstack/react-router";

export function MainLayout() {
  const isSidebarOpen = useSidebarOpen();
  const isMobile = useSidebarMobile();
  const isSidebarDesktopOpen = isSidebarOpen && !isMobile;

  return (
    <div className="flex h-full">
      <Sidebar />
      <main
        className="photo-stage flex h-full min-h-0 flex-1 flex-col overflow-hidden"
        data-sidebar-desktop-open={isSidebarDesktopOpen ? "true" : "false"}
      >
        <Outlet />
      </main>
    </div>
  );
}
