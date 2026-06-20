import { McAppShell, McSidebarNav } from "@murga.ing/components/react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";

import { useDeliveries } from "@app/store/deliveries-store";
import { useShellActions, useShellMobile, useSidebarOpen } from "@app/store/shell-store";
import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { tagsListQueryOptions } from "@lib/api/tags/query-options";
import { signOut } from "@lib/auth-client";
import { useThemeStore } from "@lib/theme";

function getCurrentSectionLabel(pathname: string) {
  if (pathname.startsWith("/sessions")) {
    return "Sessions";
  }

  if (pathname.startsWith("/photos")) {
    return "Photos";
  }

  if (pathname.startsWith("/tags")) {
    return "Tags";
  }

  if (pathname.startsWith("/deliveries")) {
    return "Deliveries";
  }

  return "Overview";
}

function getNavigationItems(
  pathname: string,
  totalSessions: number,
  totalPhotos: number,
  totalTags: number,
  totalDeliveries: number,
) {
  return [
    {
      id: "overview",
      label: "Overview",
      current: pathname === "/",
    },
    {
      id: "sessions",
      label: "Sessions",
      count: totalSessions,
      current: pathname.startsWith("/sessions"),
    },
    {
      id: "photos",
      label: "Photos",
      count: totalPhotos,
      current: pathname.startsWith("/photos"),
    },
    {
      id: "tags",
      label: "Tags",
      count: totalTags,
      current: pathname.startsWith("/tags"),
    },
    {
      id: "deliveries",
      label: "Deliveries",
      count: totalDeliveries,
      current: pathname.startsWith("/deliveries"),
    },
  ];
}

function getFooterItems() {
  return [
    {
      id: "upload-delivery",
      label: "Subir delivery",
      description: "Crear una nueva entrega",
    },
    {
      id: "public-site",
      label: "Ver sitio",
      description: "Abrir portfolio publico",
    },
    {
      id: "logout",
      label: "Logout",
      description: "Cerrar sesion del dashboard",
    },
  ];
}

export function AdminShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const { data: sessions } = useSuspenseQuery(sessionsListQueryOptions());
  const { data: tags } = useSuspenseQuery(tagsListQueryOptions());
  const deliveries = useDeliveries();
  const isMobile = useShellMobile();
  const isSidebarOpen = useSidebarOpen();
  const { closeSidebar, setSidebarOpen, toggleSidebar } = useShellActions();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const totalPhotos = sessions.reduce((sum, session) => sum + (session.photos?.length ?? 0), 0);
  const sectionLabel = getCurrentSectionLabel(location.pathname);

  return (
    <McAppShell
      mobileOverlay={isMobile}
      onMcSidebarOpenChange={(event) => {
        setSidebarOpen(event.detail.open);
      }}
      sidebarOpen={isSidebarOpen}
    >
      <div slot="sidebar" className="admin-sidebar-slot">
        <McSidebarNav
          ariaLabel="Dashboard navigation"
          footerItems={getFooterItems()}
          items={getNavigationItems(
            location.pathname,
            sessions.length,
            totalPhotos,
            tags.length,
            deliveries.length,
          )}
          onMcSelect={(event) => {
            void (async () => {
              switch (event.detail.selectedId) {
                case "upload-delivery":
                  await navigate({ to: "/deliveries/new" });
                  break;
                case "public-site":
                  window.open("/", "_blank", "noopener,noreferrer");
                  break;
                case "logout":
                  await signOut();
                  queryClient.clear();
                  await navigate({ to: "/login" });
                  break;
                case "sessions":
                  await navigate({ to: "/sessions" });
                  break;
                case "photos":
                  await navigate({ to: "/photos", search: { page: 1 } });
                  break;
                case "tags":
                  await navigate({ to: "/tags" });
                  break;
                case "deliveries":
                  await navigate({ to: "/deliveries" });
                  break;
                default:
                  await navigate({ to: "/" });
                  break;
              }

              if (isMobile) {
                closeSidebar();
              }
            })();
          }}
          open={false}
        >
          <div slot="header" className="admin-sidebar-identity">
            <div className="admin-sidebar-kicker">Dashboard</div>
            <div className="admin-sidebar-title">RoncalPhoto</div>
            <p className="admin-sidebar-copy">
              Overview, lectura completa y edición persistente de sesiones y fotos.
            </p>
          </div>
          <div slot="footer" className="admin-sidebar-footer">
            <mc-status-text label={`${totalPhotos} fotos activas en D1`} polite tone="success" />
            <mc-theme-switcher
              aria-label="Tema de color"
              dark-label="Oscuro"
              light-label="Claro"
              onmc-theme-change={(event) => {
                setTheme(event.detail.theme);
              }}
              theme={theme}
            />
          </div>
        </McSidebarNav>
      </div>

      <header slot="header" className="admin-topbar">
        <div>
          <div className="admin-kicker">RoncalPhoto Dashboard</div>
          <h1>{sectionLabel}</h1>
        </div>
        <div className="admin-topbar-actions">
          <mc-button className="admin-inline-button" onClick={toggleSidebar} variant="secondary">
            {isSidebarOpen ? "Ocultar navegación" : "Abrir navegación"}
          </mc-button>
          <mc-button
            className="admin-inline-button"
            onClick={() => {
              void navigate({ to: "/photos/new", search: { page: 1 } });
            }}
            variant="primary"
          >
            Subir fotos
          </mc-button>
        </div>
      </header>

      <div slot="main" className="admin-main-slot">
        <Outlet />
      </div>
    </McAppShell>
  );
}
