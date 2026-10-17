import { Button, MediaBrowser } from "@jmurga97/components";
import { useEffect, useRef } from "react";

import type { Photo } from "@roncal/api/router";

export function PhotoPreviewDialog({ onClose, photo }: { onClose: () => void; photo: Photo | null }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (photo && dialog && !dialog.open) dialog.showModal();
    if (!photo && dialog?.open) dialog.close();
  }, [photo]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="photo-preview-title"
      className="admin-preview-dialog"
      onCancel={onClose}
      onClose={onClose}
    >
      {photo ? (
        <div className="ming-stack">
          <div className="ming-cluster ming-cluster--between">
            <h2 id="photo-preview-title">{photo.alt}</h2>
            <Button variant="ghost" onClick={() => dialogRef.current?.close()}>
              Cerrar previsualización
            </Button>
          </div>
          <MediaBrowser
            items={[{ id: photo.id, src: photo.url, alt: photo.alt, caption: photo.about }]}
            selectedId={photo.id}
            showRail={false}
          />
        </div>
      ) : null}
    </dialog>
  );
}
