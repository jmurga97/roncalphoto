import { formatBytes } from "../utils/format-bytes";

import type { DeliveryPhotoViewModel } from "../types";

interface DeliveryListRowProps {
  photo: DeliveryPhotoViewModel;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
  onDownload: () => void;
  onOpen: () => void;
}

export function DeliveryListRow({
  photo,
  selected,
  disabled,
  onToggle,
  onDownload,
  onOpen,
}: DeliveryListRowProps) {
  return (
    <li className="flex items-center gap-3 rounded-[var(--radius-md)] border ui-divider bg-[color:var(--color-surface)] p-2 transition-colors sm:gap-4 sm:p-3">
      <input
        aria-label={`Seleccionar ${photo.title}`}
        checked={selected}
        className="h-4 w-4 shrink-0 accent-[var(--color-accent)]"
        onChange={onToggle}
        type="checkbox"
      />

      <button
        aria-label={`Ver ${photo.title} en la galería`}
        className="shrink-0 overflow-hidden rounded-[var(--radius-sm)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
        onClick={onOpen}
        type="button"
      >
        <img
          alt={photo.title}
          className="h-14 w-14 object-cover sm:h-16 sm:w-16"
          decoding="async"
          loading="lazy"
          src={photo.thumbnailSrc}
        />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[color:var(--color-text)]">{photo.title}</p>
        <p className="ui-muted text-xs">{formatBytes(photo.sizeBytes)}</p>
      </div>

      <button
        className="shrink-0 rounded-md border ui-divider px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-accent)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        onClick={onDownload}
        type="button"
      >
        Descargar
      </button>
    </li>
  );
}
