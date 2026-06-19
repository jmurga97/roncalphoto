import { DeliveryListRow } from "./delivery-list-row";
import { useDeliveryDownload } from "../hooks/use-delivery-download";

import type { DeliverySelection } from "../hooks/use-delivery-selection";
import type { DeliveryPhotoViewModel } from "../types";

interface DeliveryListProps {
  title: string;
  photos: DeliveryPhotoViewModel[];
  selection: DeliverySelection;
  onOpenPhoto: (photoId: string) => void;
}

function buildArchiveName(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug || "entrega"}.zip`;
}

export function DeliveryList({ title, photos, selection, onOpenPhoto }: DeliveryListProps) {
  const { isDownloading, error, downloadOne, downloadZipArchive } = useDeliveryDownload();

  const selectedPhotos = photos.filter((photo) => selection.isSelected(photo.id));
  const photosToZip = selectedPhotos.length > 0 ? selectedPhotos : photos;
  const zipLabel =
    selection.selectedCount > 0
      ? `Descargar selección (${selection.selectedCount})`
      : `Descargar todo (${photos.length})`;

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-4 py-8 sm:px-6">
      <header className="shrink-0">
        <p className="ui-kicker">Entrega de fotos</p>
        <h1 className="editorial-title mt-2 text-balance">{title}</h1>
        <p className="ui-muted mt-2 text-sm">
          {photos.length} {photos.length === 1 ? "fotografía" : "fotografías"}
        </p>
      </header>

      <div className="mt-6 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b ui-divider pb-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            checked={selection.allSelected}
            className="h-4 w-4 accent-[var(--color-accent)]"
            onChange={selection.toggleAll}
            type="checkbox"
          />
          Seleccionar todo
        </label>

        <button
          className="rounded-md bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-[color:var(--color-text-welcome)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isDownloading || photos.length === 0}
          onClick={() => void downloadZipArchive(photosToZip, buildArchiveName(title))}
          type="button"
        >
          {isDownloading ? "Preparando…" : `${zipLabel} · ZIP`}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-3 shrink-0 text-sm text-[color:#b3261e]">
          {error}
        </p>
      ) : null}

      <ul className="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-24">
        {photos.map((photo) => (
          <DeliveryListRow
            disabled={isDownloading}
            key={photo.id}
            onDownload={() => void downloadOne(photo)}
            onOpen={() => onOpenPhoto(photo.id)}
            onToggle={() => selection.toggle(photo.id)}
            photo={photo}
            selected={selection.isSelected(photo.id)}
          />
        ))}
      </ul>
    </div>
  );
}
