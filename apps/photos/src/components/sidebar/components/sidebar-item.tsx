import { useSidebarActions, useSidebarMobile } from "@app/store";
import { Link } from "@tanstack/react-router";
import { prefersReducedMotion } from "@utils/prefers-reduced-motion";
import type { SidebarNavigationItem } from "../types";

interface SidebarItemProps {
  item: SidebarNavigationItem;
}

const preloadedImageSrcs = new Set<string>();

function preloadSessionImage(imageSrc: string | undefined) {
  if (!imageSrc || preloadedImageSrcs.has(imageSrc) || prefersReducedMotion()) {
    return;
  }

  preloadedImageSrcs.add(imageSrc);

  const image = new Image();
  image.decoding = "async";
  image.src = imageSrc;

  if (typeof image.decode === "function") {
    void image.decode().catch(() => undefined);
  }
}

export function SidebarItem({ item }: SidebarItemProps) {
  const isMobile = useSidebarMobile();
  const { closeSidebar } = useSidebarActions();
  const enableViewTransition = !prefersReducedMotion();
  const preloadImage = () => preloadSessionImage(item.preloadImageSrc);

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
        onFocus={preloadImage}
        onMouseEnter={preloadImage}
        onTouchStart={preloadImage}
        params={{ slug: item.slug }}
        preload="intent"
        search={() => ({})}
        to="/session/$slug"
        viewTransition={enableViewTransition}
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
