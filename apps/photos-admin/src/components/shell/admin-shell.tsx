import { AppShell, SidebarNav, Switch } from "@jmurga97/components";
import { useQueryClient } from "@tanstack/react-query";
import { Outlet, useLocation, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useShellActions, useShellMobile, useSidebarOpen } from "@app/store/shell-store";
import { signOut } from "@lib/auth-client";

const sections = [
  { id: "overview", label: "Resumen", href: "/" },
  { id: "sessions", label: "Sesiones", href: "/sessions" },
  { id: "photos", label: "Fotos", href: "/photos" },
  { id: "tags", label: "Etiquetas", href: "/tags" },
  { id: "deliveries", label: "Entregas", href: "/deliveries" },
];

export function AdminShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useRouteContext({ from: "/_auth" });
  const { pathname } = useLocation();
  const isMobile = useShellMobile();
  const isSidebarOpen = useSidebarOpen();
  const { closeSidebar, setSidebarOpen } = useShellActions();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [logoutPending, setLogoutPending] = useState(false);
  const section = sections.find((item) => item.href !== "/" && pathname.startsWith(item.href)) ?? sections[0];
  let detailLabel = pathname === section.href ? null : "Detalle";
  if (pathname.endsWith("/new")) detailLabel = "Crear";

  async function onNavigate(id: string) {
    if (id === "logout") {
      if (logoutPending) return;
      setLogoutPending(true);
      try {
        await signOut();
        queryClient.clear();
        await navigate({ to: "/login" });
      } catch {
        toast.error("No se pudo cerrar la sesión. Inténtalo de nuevo.");
      } finally {
        setLogoutPending(false);
      }
    } else {
      await navigate({ to: sections.find((item) => item.id === id)?.href ?? "/" });
    }
    if (isMobile) closeSidebar();
  }

  return (
    <AppShell
      className="admin-app-shell"
      open={isSidebarOpen}
      onOpenChange={setSidebarOpen}
      navigationLabel="Navegación del panel"
      closeNavigationLabel="Cerrar navegación"
      hideNavigationLabel="Ocultar navegación"
      showNavigationLabel="Mostrar navegación"
      header={
        <nav aria-label="Ruta">
          <ol className="ming-breadcrumb">
            <li>RoncalPhoto</li>
            <li aria-current={detailLabel ? undefined : "page"}>{section.label}</li>
            {detailLabel ? <li aria-current="page">{detailLabel}</li> : null}
          </ol>
        </nav>
      }
      navigation={
        <div className="admin-sidebar-slot">
          <SidebarNav
            ariaLabel="Navegación del panel"
            header={
              <div className="admin-sidebar-identity">
                <span className="admin-sidebar-kicker">Portfolio</span>
                <span className="admin-sidebar-title">RoncalPhoto</span>
              </div>
            }
            items={sections.map((item) => ({ ...item, current: item.id === section.id }))}
            onNavigate={(id) => {
              void onNavigate(id);
            }}
            footerItems={[
              {
                id: "logout",
                label: logoutPending ? "Cerrando sesión…" : "Cerrar sesión",
                disabled: logoutPending,
              },
            ]}
            footer={
              <div className="admin-sidebar-footer">
                <p className="admin-sidebar-copy break-all">{session?.user.email}</p>
                <a className="admin-link" href="https://roncalphoto.com" target="_blank" rel="noopener noreferrer">
                  Ver portfolio ↗
                </a>
                <Switch
                  label="Modo oscuro"
                  checked={dark}
                  onCheckedChange={(checked) => {
                    setDark(checked);
                    const theme = checked ? "dark" : "light";
                    document.documentElement.classList.remove("light", "dark");
                    document.documentElement.classList.add(theme);
                    document.documentElement.style.colorScheme = theme;
                    document
                      .querySelector('meta[name="theme-color"]')
                      ?.setAttribute("content", checked ? "#000000" : "#f5f5f5");
                    try {
                      localStorage.setItem("roncalphoto-admin-theme", theme);
                    } catch {
                      /* Theme still applies when storage is unavailable. */
                    }
                  }}
                />
              </div>
            }
          />
        </div>
      }
    >
      <div className="admin-main-slot">
        <Outlet />
      </div>
    </AppShell>
  );
}
