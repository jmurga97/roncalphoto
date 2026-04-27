import type { Session } from "@roncal/shared";
import type { SidebarNavigationItem } from "../types";

export function toSidebarNavigationItem(
  session: Pick<Session, "id" | "slug" | "title">,
  activeSlug?: string,
): SidebarNavigationItem {
  return {
    id: session.id,
    isActive: session.slug === activeSlug,
    label: session.title,
    slug: session.slug,
  };
}
