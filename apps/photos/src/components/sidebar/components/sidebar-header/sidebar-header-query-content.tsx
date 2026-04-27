import { sessionDetailQueryOptions } from "@lib/api/sessions/query-options";
import { useSuspenseQuery } from "@tanstack/react-query";
import { RichTextRenderer } from "@utils/render-rich-text";
import { useSidebarData } from "../../hooks/use-sidebar-data";
import { mapSessionToSidebarHeader } from "./map-session-to-sidebar-header";
import { SidebarHeaderContent } from "./sidebar-header-content";

export function SidebarHeaderQueryContent() {
  const { slug, photo: photoId } = useSidebarData();

  if (!slug) {
    return null;
  }

  const {
    data: { activePhotoAbout, descriptionDocument, tags, title },
  } = useSuspenseQuery({
    ...sessionDetailQueryOptions(slug),
    select: (session) => mapSessionToSidebarHeader(session, photoId),
  });

  return (
    <SidebarHeaderContent
      activePhotoAbout={activePhotoAbout}
      bodyContent={<RichTextRenderer document={descriptionDocument} />}
      tags={tags}
      title={title}
    />
  );
}
