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
      <details className="related-sessions-accordion rounded-[var(--radius-sm)] border bg-[color:color-mix(in_srgb,var(--color-surface-2)_12%,transparent)] ui-divider">
        <summary className="related-sessions-summary flex cursor-pointer list-none items-center justify-between gap-3 px-[0.7rem] py-[0.55rem] text-[0.76rem] font-bold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
          <span>Sesiones con tags en común</span>
          <span className="inline-flex h-[1.45rem] min-w-[1.45rem] items-center justify-center rounded-full border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_78%,transparent)] text-[0.68rem] font-bold text-[var(--color-text)]">
            {items.length}
          </span>
        </summary>
        <ul
          className="h-40 overflow-y-auto rounded-b-[var(--radius-sm)] border-t bg-[color:color-mix(in_srgb,var(--color-surface-2)_28%,transparent)] p-0 [scrollbar-gutter:stable] ui-divider"
          data-sidebar-scroll-list="true"
        >
          {items.map((item) => (
            <SidebarItem item={item} key={item.id} />
          ))}
        </ul>
      </details>
    </section>
  );
}
