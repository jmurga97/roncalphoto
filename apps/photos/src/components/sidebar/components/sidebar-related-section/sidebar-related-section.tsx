import { SuspenseWrapper } from "@roncal/ui";
import { useSidebarData } from "../../hooks/use-sidebar-data";
import { SidebarRelatedSectionContent } from "./sidebar-related-section-content";
import { SidebarRelatedSectionError } from "./sidebar-related-section-error";
import { SidebarRelatedSectionLoading } from "./sidebar-related-section-loading";

export function SidebarRelatedSection() {
  const { slug } = useSidebarData();

  if (!slug) {
    return null;
  }

  return (
    <SuspenseWrapper
      errorFallback={<SidebarRelatedSectionError />}
      fallback={<SidebarRelatedSectionLoading />}
      resetKey={slug}
    >
      <SidebarRelatedSectionContent />
    </SuspenseWrapper>
  );
}
