import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export interface SidebarHeaderTag {
  id: string;
  name: string;
}

export interface SidebarHeaderContentProps {
  activePhotoAbout?: string;
  bodyContent: ReactNode;
  tags?: SidebarHeaderTag[];
  title: string;
}

export function SidebarHeaderContent({
  activePhotoAbout,
  bodyContent,
  tags = [],
  title,
}: SidebarHeaderContentProps) {
  return (
    <header className="space-y-3 border-b pb-6 ui-divider">
      <Link
        className="block rounded-sm focus-visible:outline-none"
        data-sidebar-focus-target="true"
        to="/"
      >
        <p className="ui-kicker">RoncalPhoto</p>
      </Link>
      <h1 className="editorial-heading mt-2">{title}</h1>
      {tags.length > 0 ? (
        <ul className="tag-row-scroll mt-1" aria-label={`Tags de ${title}`}>
          {tags.map((tag) => (
            <li key={tag.id}>
              <span className="tag-pill">{tag.name}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="editorial-prose">{bodyContent}</div>
      <p
        aria-live="polite"
        className="ui-muted mt-3 text-sm leading-relaxed"
        hidden={!activePhotoAbout}
      >
        {activePhotoAbout ?? ""}
      </p>
    </header>
  );
}
