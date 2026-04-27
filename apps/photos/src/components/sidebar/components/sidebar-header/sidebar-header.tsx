import { SuspenseWrapper } from "@components/suspense-wrapper";
import { useSidebarData } from "../../hooks/use-sidebar-data";
import { SidebarHeaderError } from "./sidebar-header-error";
import { SidebarHeaderLoading } from "./sidebar-header-loading";
import { SidebarHeaderQueryContent } from "./sidebar-header-query-content";
import { SidebarHeaderStaticContent } from "./sidebar-header-static-content";

export function SidebarHeader() {
  const { slug } = useSidebarData();

  if (!slug) {
    return <SidebarHeaderStaticContent />;
  }

  return (
    <SuspenseWrapper
      errorFallback={<SidebarHeaderError />}
      fallback={<SidebarHeaderLoading />}
      slug={slug}
    >
      <SidebarHeaderQueryContent />
    </SuspenseWrapper>
  );
}
