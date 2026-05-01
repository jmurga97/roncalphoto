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
    <li className="session-menu-item">
      <Link
        aria-current={item.isActive ? "page" : undefined}
        className={[
          "session-menu-link block px-3 py-2.5 text-[0.88rem] leading-snug transition-colors",
          item.isActive ? "font-bold text-(--color-text)" : "ui-link",
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
