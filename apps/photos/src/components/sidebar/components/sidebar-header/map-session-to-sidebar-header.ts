import type { Session } from "@roncal/shared";
import { parseRichText } from "@utils/render-rich-text";
import { resolvePhotoSelection } from "@utils/resolve-photo-selection";
import { DEFAULT_DESCRIPTION } from "../../constants";

export function mapSessionToSidebarHeader(session: Session, photoId?: string) {
  return {
    activePhotoAbout: resolvePhotoSelection(session.photos, photoId).selectedPhoto?.about,
    descriptionDocument: parseRichText(session.description || DEFAULT_DESCRIPTION),
    tags: session.tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
    })),
    title: session.title,
  };
}
