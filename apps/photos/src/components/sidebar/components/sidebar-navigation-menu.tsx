import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { useQuery } from "@tanstack/react-query";
import { useSidebarData } from "../hooks/use-sidebar-data";
import { toSidebarNavigationItem } from "../utils/sidebar-mappers";
import { SidebarItem } from "./sidebar-item";

export function SidebarNavigationMenu() {
  const { slug } = useSidebarData();
  const { data: sessions } = useQuery(sessionsListQueryOptions());
  const heading = slug ? "Explora otras sesiones" : "Sesiones y tags";
  const items = sessions?.map((session) => toSidebarNavigationItem(session, slug));

  return (
    <section className="pt-6">
      <header className="mb-3.5">
        <p className="ui-kicker">Navegación</p>
        <h2 className="mt-1 text-sm font-semibold uppercase tracking-[0.08em]">{heading}</h2>
      </header>

      <ul
        className="session-menu-list rounded-md border ui-divider"
        data-sidebar-scroll-list="true"
      >
        {items?.map((item) => (
          <SidebarItem item={item} key={item.id} />
        ))}
      </ul>
    </section>
  );
}
