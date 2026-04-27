import { SuspenseWrapper } from "@components/suspense-wrapper";
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
      slug={slug}
    >
      <SidebarRelatedSectionContent />
    </SuspenseWrapper>
  );
}
