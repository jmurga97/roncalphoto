import { RoncalPhotoBrand } from "@components/brand/roncalphoto-brand";
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
      <RoncalPhotoBrand
        className="block rounded-sm focus-visible:outline-none"
        sidebarFocusTarget
      />
      <h1 className="editorial-heading mt-2">{title}</h1>
      {tags.length > 0 ? (
        <ul
          className="tag-row-scroll mt-1 flex gap-[0.35rem] overflow-x-auto overflow-y-hidden whitespace-nowrap [-webkit-overflow-scrolling:touch]"
          aria-label={`Tags de ${title}`}
        >
          {tags.map((tag) => (
            <li className="shrink-0" key={tag.id}>
              <span className="inline-flex items-center rounded-full border border-[color:color-mix(in_srgb,var(--color-accent)_42%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-surface)_84%,transparent)] px-[0.55rem] py-[0.15rem] text-[0.7rem] font-semibold leading-[1.2] tracking-[0.03em] whitespace-nowrap text-[var(--color-text)]">
                {tag.name}
              </span>
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
