import { useSuspenseQuery } from "@tanstack/react-query";

import { sessionDetailQueryOptions } from "@lib/api/sessions/query-options";
import { RichTextRenderer } from "@utils/render-rich-text";

import { mapSessionToSidebarHeader } from "./map-session-to-sidebar-header";
import { SidebarHeaderContent } from "./sidebar-header-content";
import { useSidebarData } from "../../hooks/use-sidebar-data";

export function SidebarHeaderQueryContent() {
  const { slug, photo: photoId } = useSidebarData();

  if (!slug) {
    return null;
  }

  return <SidebarHeaderQueryContentBody photoId={photoId} slug={slug} />;
}

function SidebarHeaderQueryContentBody({ photoId, slug }: { photoId?: string; slug: string }) {
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
