import { useShellActions, useShellMobile, useSidebarOpen } from "@app/store/shell-store";
import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { tagsListQueryOptions } from "@lib/api/tags/query-options";
import { signOut } from "@lib/auth-client";
import { McAppShell, McButton, McSidebarNav, McStatusText } from "@murga/components/react";
import { useQueryClient } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";

function getCurrentSectionLabel(pathname: string) {
  if (pathname.startsWith("/components")) {
    return "Components";
  }

  if (pathname.startsWith("/sessions")) {
    return "Sessions";
  }

  if (pathname.startsWith("/photos")) {
    return "Photos";
  }

  if (pathname.startsWith("/tags")) {
    return "Tags";
  }

  return "Overview";
}

function getNavigationItems(
  pathname: string,
  totalSessions: number,
  totalPhotos: number,
  totalTags: number,
) {
  return [
    {
      id: "overview",
      label: "Overview",
      current: pathname === "/",
    },
    {
      id: "components",
      label: "Components",
      current: pathname.startsWith("/components"),
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
  ];
}

function getFooterItems() {
  return [
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
  const isMobile = useShellMobile();
  const isSidebarOpen = useSidebarOpen();
  const { closeSidebar, setSidebarOpen, toggleSidebar } = useShellActions();
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
          items={getNavigationItems(location.pathname, sessions.length, totalPhotos, tags.length)}
          onMcSelect={async (event) => {
            switch (event.detail.selectedId) {
              case "public-site":
                window.open("/", "_blank", "noopener,noreferrer");
                break;
              case "logout":
                await signOut();
                queryClient.clear();
                await navigate({ to: "/login" });
                break;
              case "components":
                navigate({ to: "/components" });
                break;
              case "sessions":
                navigate({ to: "/sessions" });
                break;
              case "photos":
                navigate({ to: "/photos", search: { page: 1 } });
                break;
              case "tags":
                navigate({ to: "/tags" });
                break;
              default:
                navigate({ to: "/" });
                break;
            }

            if (isMobile) {
              closeSidebar();
            }
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
            <McStatusText label={`${totalPhotos} fotos activas en D1`} polite tone="success" />
          </div>
        </McSidebarNav>
      </div>

      <header slot="header" className="admin-topbar">
        <div>
          <div className="admin-kicker">RoncalPhoto Dashboard</div>
          <h1>{sectionLabel}</h1>
        </div>
        <div className="admin-topbar-actions">
          <McButton className="admin-inline-button" onClick={toggleSidebar} variant="secondary">
            {isSidebarOpen ? "Ocultar navegación" : "Abrir navegación"}
          </McButton>
          <McButton
            className="admin-inline-button"
            onClick={() => {
              navigate({ to: "/photos/new", search: { page: 1 } });
            }}
            variant="primary"
          >
            Nueva foto
          </McButton>
        </div>
      </header>

      <div slot="main" className="admin-main-slot">
        <Outlet />
      </div>
    </McAppShell>
  );
}
