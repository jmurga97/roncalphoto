import { SuspenseWrapper } from "@roncal/ui";

import { SidebarHeaderError } from "./sidebar-header-error";
import { SidebarHeaderLoading } from "./sidebar-header-loading";
import { SidebarHeaderQueryContent } from "./sidebar-header-query-content";
import { SidebarHeaderStaticContent } from "./sidebar-header-static-content";
import { useSidebarData } from "../../hooks/use-sidebar-data";

export function SidebarHeader() {
  const { slug } = useSidebarData();

  if (!slug) {
    return <SidebarHeaderStaticContent />;
  }

  return (
    <SuspenseWrapper
      errorFallback={<SidebarHeaderError />}
      fallback={<SidebarHeaderLoading />}
      resetKey={slug}
    >
      <SidebarHeaderQueryContent />
    </SuspenseWrapper>
  );
}
