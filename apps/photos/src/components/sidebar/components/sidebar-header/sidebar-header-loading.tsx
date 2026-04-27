import { SidebarSkeleton } from "../sidebar-skeleton";
import { SidebarHeaderContent } from "./sidebar-header-content";

export function SidebarHeaderLoading() {
  return (
    <SidebarHeaderContent
      bodyContent={<SidebarSkeleton showMetaLine={false} titleLines={3} />}
      tags={[]}
      title="Cargando sesión..."
    />
  );
}
