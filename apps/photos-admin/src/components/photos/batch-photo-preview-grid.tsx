import { Button } from "@jmurga97/components";

import { formatImageFileSize } from "@lib/photos/batch-images";

import type { BatchImagePreview } from "@lib/photos/batch-images";
import type { ReactNode } from "react";

export type BatchPhotoPreview = BatchImagePreview;

export function BatchPhotoPreviewGrid<TItem extends BatchImagePreview>({
  ariaLabel = "Imágenes seleccionadas",
  contentClassName = "grid gap-ming-4 p-ming-4",
  gridClassName = "admin-preview-grid",
  imageClassName = "bg-muted aspect-4/3 overflow-hidden",
  items,
  itemClassName = "",
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
            <img className="block size-full object-cover" alt={item.title} src={item.previewUrl} />
          </div>
          <div className={contentClassName}>
            {renderBody ? (
              renderBody(item, index)
            ) : (
              <>
                <div className="min-w-0">
                  <h3 className="text-foreground m-0 truncate text-base">{item.title}</h3>
                  <p
                    className="text-muted-foreground m-0 truncate text-[length:var(--admin-text-body-sm)]"
                    title={item.fileName}
                  >
                    {item.fileName}
                  </p>
                </div>
                <div className="text-muted-foreground flex items-center justify-between gap-ming-3 text-[length:var(--admin-text-body-sm)]">
                  <span>{formatImageFileSize(item.fileSize)}</span>
                  <Button
                    aria-label={`Quitar ${item.fileName}`}
                    onClick={() => {
                      onRemove(item.id, index);
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    Quitar
                  </Button>
                </div>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
