import type { Session } from "@roncal/shared";
import type { SidebarNavigationItem } from "../types";

export function toSidebarNavigationItem(
  session: Pick<Session, "id" | "photos" | "slug" | "title">,
  activeSlug?: string,
): SidebarNavigationItem {
  return {
    id: session.id,
    isActive: session.slug === activeSlug,
    label: session.title,
    preloadImageSrc: session.photos[0]?.url,
    slug: session.slug,
  };
}
