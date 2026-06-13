import { useEffect, useRef } from "react";

import type { ApiPhoto } from "@roncal/shared";

export function PhotoPreviewDialog({
  onClose,
  photo,
}: {
  onClose: () => void;
  photo: ApiPhoto | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (photo && dialog && !dialog.open) {
      dialog.showModal();
    }

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) {
        dialog?.close();
      }
    };

    dialog?.addEventListener("click", handleBackdropClick);

    return () => {
      dialog?.removeEventListener("click", handleBackdropClick);
    };
  }, [photo]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Previsualización de foto"
      className="border-mc-border-visible bg-mc-surface text-mc-text-primary max-h-[90dvh] w-[min(92vw,72rem)] overflow-auto rounded-2xl border p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      onCancel={onClose}
      onClose={onClose}
    >
      {photo ? (
        <div className="grid gap-4 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="grid min-w-0 gap-1.5">
              <div className="admin-kicker">Preview</div>
              <h2 className="text-mc-text-display m-0 truncate text-[clamp(1.25rem,3vw,2rem)]">
                {photo.alt}
              </h2>
            </div>
            <mc-button
              aria-label="Cerrar previsualización"
              onClick={() => {
                dialogRef.current?.close();
              }}
              variant="secondary"
            >
              Cerrar
            </mc-button>
          </div>
          <img
            className="block max-h-[calc(90dvh-6rem)] w-full rounded-lg object-contain"
            alt={photo.alt}
            src={photo.url}
          />
        </div>
      ) : null}
    </dialog>
  );
}
