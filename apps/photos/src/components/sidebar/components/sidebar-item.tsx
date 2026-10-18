import { Link } from "@tanstack/react-router";

import { useSetHighlightedSessionSlug, useSidebarActions, useSidebarMobile } from "@app/store";

import type { SessionSummary } from "@roncal/api/router";

interface SidebarItemProps {
  session: Pick<SessionSummary, "slug" | "title">;
}

/**
 * Opens the session at its first photo (`/session/$slug`). Hover previews the dimming.
 */
export function SidebarItem({ session }: SidebarItemProps) {
  const isMobile = useSidebarMobile();
  const { closeSidebar } = useSidebarActions();
  const setHighlightedSessionSlug = useSetHighlightedSessionSlug();
  const highlightSession = () => setHighlightedSessionSlug(session.slug);
  const clearHighlight = () => setHighlightedSessionSlug(undefined);

  return (
    // Branch decoration: vertical trunk (ends at the tick on the last item) + horizontal tick.
    <li
      className={[
        "relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-[color:color-mix(in_srgb,var(--color-text-muted)_40%,transparent)] before:content-[''] last:before:bottom-1/2",
        "after:absolute after:left-0 after:top-1/2 after:h-px after:w-3 after:content-['']",
        "after:bg-[color:color-mix(in_srgb,var(--color-text-muted)_40%,transparent)]",
      ].join(" ")}
    >
      <Link
        className="ui-link flex min-w-0 items-center justify-between gap-2 py-2 pl-6 pr-1 text-[0.88rem] leading-snug tracking-[0.02em] transition-colors [overflow-wrap:anywhere]"
        onBlur={clearHighlight}
        onClick={() => {
          clearHighlight();

          if (isMobile) {
            closeSidebar();
          }
        }}
        onFocus={highlightSession}
        onMouseEnter={highlightSession}
        onMouseLeave={clearHighlight}
        params={{ slug: session.slug }}
        search={{ photo: undefined, tag: undefined }}
        to="/session/$slug"
      >
        {session.title}
      </Link>
    </li>
  );
}
