import { STUDIO_SECTIONS } from "@components/studio/studio-sections";

import type { StudioSection } from "@components/studio/studio-sections";

interface SidebarFooterProps {
  onOpenStudio: (section: StudioSection) => void;
}

export function SidebarFooter({ onOpenStudio }: SidebarFooterProps) {
  return (
    <footer className="mt-auto border-t pt-6 ui-divider">
      <nav aria-label="Estudio" className="flex flex-col gap-1">
        {STUDIO_SECTIONS.map(({ id, label }) => (
          <button
            aria-controls="estudio"
            aria-haspopup="dialog"
            className="sidebar-link-action ui-link flex min-h-11 w-full items-center justify-between gap-4 text-left text-sm font-semibold"
            key={id}
            onClick={() => onOpenStudio(id)}
            type="button"
          >
            {label}
            <span aria-hidden="true" className="sidebar-link-indicator">
              ↗
            </span>
          </button>
        ))}
      </nav>
    </footer>
  );
}
