import { SidebarSkeleton } from "../sidebar-skeleton";

export function SidebarRelatedSectionLoading() {
  return (
    <section aria-hidden="true" className="mt-6 border-t py-6 ui-divider">
      <div className="space-y-2">
        <p className="ui-kicker">Otras sesiones relacionadas</p>
        <SidebarSkeleton showMetaLine={false} titleLines={2} />
      </div>
    </section>
  );
}
