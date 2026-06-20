import { formatImageFileSize } from "@lib/photos/batch-images";

import type { BatchImagePreview } from "@lib/photos/batch-images";
import type { ReactNode } from "react";

export type BatchPhotoPreview = BatchImagePreview;

export function BatchPhotoPreviewGrid<TItem extends BatchImagePreview>({
  ariaLabel = "Imágenes seleccionadas",
  contentClassName = "grid gap-4 p-4",
  gridClassName = "m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,14rem),1fr))] gap-4 p-0",
  imageClassName = "bg-mc-surface-raised aspect-4/3 overflow-hidden",
  items,
  itemClassName = "border-mc-border bg-mc-surface min-w-0 overflow-hidden rounded-[0.875rem] border",
  onRemove,
  renderBody,
}: {
  ariaLabel?: string;
  contentClassName?: string;
  gridClassName?: string;
  imageClassName?: string;
  items: TItem[];
  itemClassName?: string;
  onRemove: (id: string, index: number) => void;
  renderBody?: (item: TItem, index: number) => ReactNode;
}) {
  return (
    <ul className={gridClassName} aria-label={ariaLabel}>
      {items.map((item, index) => (
        <li key={item.id} className={itemClassName}>
          <div className={imageClassName}>
            <img className="block size-full object-cover" alt="" src={item.previewUrl} />
          </div>
          <div className={contentClassName}>
            {renderBody ? (
              renderBody(item, index)
            ) : (
              <>
                <div className="min-w-0">
                  <h3 className="text-mc-text-display m-0 truncate text-base">{item.title}</h3>
                  <p
                    className="text-mc-text-secondary m-0 truncate text-[0.8125rem]"
                    title={item.fileName}
                  >
                    {item.fileName}
                  </p>
                </div>
                <div className="text-mc-text-secondary flex items-center justify-between gap-3 text-[0.8125rem]">
                  <span>{formatImageFileSize(item.fileSize)}</span>
                  <mc-button
                    aria-label={`Quitar ${item.fileName}`}
                    onClick={() => {
                      onRemove(item.id, index);
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    Quitar
                  </mc-button>
                </div>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
