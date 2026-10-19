import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";

import { useSidebarActions, useSidebarMobile } from "@app/store";
import { trpc } from "@lib/api/client";

import { TAG_CHIP_CLASS } from "../constants";

import type { SessionSummary } from "@roncal/api/router";

function collectTags(sessions: SessionSummary[]) {
  const tags = new Map(sessions.flatMap((session) => session.tags.map((tag) => [tag.slug, tag] as const)));

  return [...tags.values()].toSorted((a, b) => a.name.localeCompare(b.name));
}

/**
 * Canvas tag filter: one active tag at a time, kept in the URL (`/?tag=`).
 */
export function SidebarTagFilter() {
  const search = useSearch({ from: "/_app", shouldThrow: false });
  const { data: sessions } = useQuery(trpc.sessions.list.queryOptions());
  const isMobile = useSidebarMobile();
  const { closeSidebar } = useSidebarActions();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sessions) {
    return null;
  }

  const tags = collectTags(sessions);

  if (tags.length === 0) {
    return null;
  }

  const visibleTags = isExpanded ? tags : tags.slice(0, 8);

  return (
    <section aria-label="Filtrar por tag" className="pt-5">
      <p className="ui-kicker mb-2.5">Filtrar</p>
      <ul className={isExpanded ? "flex flex-wrap gap-1.5" : "grid grid-cols-4 gap-1.5"} id="sidebar-tag-list">
        {visibleTags.map((tag) => {
          const isActive = search?.tag === tag.slug;

          return (
            <li className="min-w-0" key={tag.id}>
              <Link
                // A link cannot be "pressed"; aria-current marks the active filter among its siblings.
                aria-current={isActive ? "true" : undefined}
                className={[
                  TAG_CHIP_CLASS,
                  "min-w-0 max-w-full truncate",
                  isActive
                    ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                    : "bg-[color:color-mix(in_srgb,var(--color-surface)_60%,transparent)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]",
                ].join(" ")}
                // On mobile the sheet covers the canvas: close it so the filter is visible.
                onClick={isMobile ? closeSidebar : undefined}
                search={{ photo: undefined, tag: isActive ? undefined : tag.slug }}
                title={tag.name}
                to="/"
              >
                {tag.name}
              </Link>
            </li>
          );
        })}
      </ul>
      {tags.length > 8 ? (
        <button
          aria-controls="sidebar-tag-list"
          aria-expanded={isExpanded}
          className="ui-link mt-2 text-xs"
          onClick={() => setIsExpanded(!isExpanded)}
          type="button"
        >
          {isExpanded ? "Ver menos" : "Ver todas"}
        </button>
      ) : null}
    </section>
  );
}
