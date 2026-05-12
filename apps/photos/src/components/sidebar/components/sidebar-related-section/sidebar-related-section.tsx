import { SuspenseWrapper } from "@roncal/ui";

import { SidebarRelatedSectionContent } from "./sidebar-related-section-content";
import { SidebarRelatedSectionError } from "./sidebar-related-section-error";
import { SidebarRelatedSectionLoading } from "./sidebar-related-section-loading";
import { useSidebarData } from "../../hooks/use-sidebar-data";

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
