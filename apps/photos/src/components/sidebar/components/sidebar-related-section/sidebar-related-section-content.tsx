import { useRelatedSessions } from "../../hooks/use-related-sessions";
import { useSidebarData } from "../../hooks/use-sidebar-data";
import type { SidebarNavigationItem } from "../../types";
import { SidebarItem } from "../sidebar-item";

export function SidebarRelatedSectionContent() {
  const { slug } = useSidebarData();

  if (!slug) {
    return null;
  }

  const { items, notice } = useRelatedSessions(slug);
  const visibleNotice = notice;
  const isEmpty = items.length === 0 && !visibleNotice;

  if (isEmpty) {
    return null;
  }

  return (
    <section className="mt-6 border-t py-6 ui-divider">
      {items.length > 0 ? (
        <RelatedSessionsList items={items} />
      ) : (
        <p className="ui-muted text-xs">{visibleNotice}</p>
      )}
    </section>
  );
}

function RelatedSessionsList({ items }: { items: SidebarNavigationItem[] }) {
  return (
    <section aria-label="Otras sesiones" className="space-y-2">
      <p className="ui-kicker">Otras sesiones relacionadas</p>
      <details className="related-sessions-accordion">
        <summary className="related-sessions-summary">
          <span>Sesiones con tags en común</span>
          <span className="related-sessions-count">{items.length}</span>
        </summary>
        <ul className="session-menu-list related-sessions-list" data-sidebar-scroll-list="true">
          {items.map((item) => (
            <SidebarItem item={item} key={item.id} />
          ))}
        </ul>
      </details>
    </section>
  );
}
