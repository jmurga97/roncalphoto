import { useSidebarActions, useSidebarMobile } from "@app/store";
import { Link } from "@tanstack/react-router";
import type { SidebarNavigationItem } from "../types";

interface SidebarItemProps {
  item: SidebarNavigationItem;
}

export function SidebarItem({ item }: SidebarItemProps) {
  const isMobile = useSidebarMobile();
  const { closeSidebar } = useSidebarActions();

  return (
    <li className="relative border-0 rounded-none before:absolute before:inset-0 before:right-[calc(var(--session-menu-scrollbar-width)*-1)] before:z-0 before:pointer-events-none before:content-[''] odd:before:bg-[color:color-mix(in_srgb,var(--color-surface)_92%,transparent)] even:before:bg-[color:color-mix(in_srgb,var(--color-surface-2)_62%,transparent)]">
      <Link
        aria-current={item.isActive ? "page" : undefined}
        className={[
          "relative z-[1] block px-3 py-2.5 text-[0.88rem] leading-snug tracking-[0.02em] transition-colors",
          item.isActive ? "font-bold text-[var(--color-text)]" : "ui-link",
        ].join(" ")}
        onClick={() => {
          if (isMobile) {
            closeSidebar();
          }
        }}
        params={{ slug: item.slug }}
        search={() => ({})}
        to="/session/$slug"
      >
        <span className="flex items-center gap-2">
          {item.isActive ? (
            <span aria-hidden="true" className="text-[0.78rem] leading-none">
              &gt;
            </span>
          ) : (
            <span aria-hidden="true" className="w-[0.55rem]" />
          )}
          <span>{item.label}</span>
        </span>
      </Link>
    </li>
  );
}
