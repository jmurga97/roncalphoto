import { useEffect, useRef, useState } from "react";

import { BatchPhotoPreviewGrid } from "@components/photos/batch-photo-preview-grid";

import type { BatchPhotoPreview } from "@components/photos/batch-photo-preview-grid";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getTitleFromFilename(filename: string) {
  return filename.replace(/\.[^/.]+$/, "");
}

function toPreview(file: File): BatchPhotoPreview {
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    title: getTitleFromFilename(file.name),
  };
}

export function PhotoUploadView() {
  const [items, setItems] = useState<BatchPhotoPreview[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
  const [showIntegrationNotice, setShowIntegrationNotice] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(
    () => () => {
      itemsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    },
    [],
  );

  const removeItem = (id: string) => {
    setItems((currentItems) => {
      const removedItem = currentItems.find((item) => item.id === id);

      if (removedItem) {
        URL.revokeObjectURL(removedItem.previewUrl);
      }

      return currentItems.filter((item) => item.id !== id);
    });
    setShowIntegrationNotice(false);
  };

  const clearItems = () => {
    items.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl);
    });
    setItems([]);
    setRejectedFiles([]);
    setShowIntegrationNotice(false);
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div className="admin-kicker">Photos · Batch upload</div>
        <h2>Prepara todas las fotos de una vez.</h2>
        <p>
          Selecciona un lote de imágenes y revisa sus títulos iniciales antes de iniciar la subida.
          Podrás completar sesión, copy y metadata desde el editor de cada foto.
        </p>
      </header>

      <section className="grid gap-6" aria-labelledby="photo-upload-title">
        <div className="border-mc-border-visible bg-mc-surface flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5">
          <div className="grid gap-2">
            <div className="admin-kicker">Selección</div>
            <h3 id="photo-upload-title" className="text-mc-text-display m-0">
              Añadir imágenes
            </h3>
            <p className="text-mc-text-secondary m-0">
              JPEG, PNG o WebP. Máximo 25 MiB por archivo.
            </p>
          </div>
          <label className="border-mc-accent bg-mc-accent focus-within:outline-mc-text-display relative inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-4 py-3 font-semibold text-white focus-within:outline-2 focus-within:outline-offset-3 max-sm:w-full">
            <span>Seleccionar archivos</span>
            <input
              className="absolute size-px opacity-0"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => {
                const selectedFiles = Array.from(event.currentTarget.files ?? []);
                const validFiles = selectedFiles.filter(
                  (file) => ACCEPTED_IMAGE_TYPES.has(file.type) && file.size <= MAX_FILE_SIZE,
                );
                const invalidFiles = selectedFiles.filter(
                  (file) => !ACCEPTED_IMAGE_TYPES.has(file.type) || file.size > MAX_FILE_SIZE,
                );

                setItems((currentItems) => [...currentItems, ...validFiles.map(toPreview)]);
                setRejectedFiles(invalidFiles.map((file) => file.name));
                setShowIntegrationNotice(false);
                event.currentTarget.value = "";
              }}
              type="file"
            />
          </label>
        </div>

        {rejectedFiles.length > 0 ? (
          <mc-inline-message
            message={`No se añadieron: ${rejectedFiles.join(", ")}. Revisa el formato o el límite de 25 MiB.`}
            title="Algunos archivos no son válidos"
            tone="error"
          />
        ) : null}

        {items.length > 0 ? (
          <>
            <div className="flex min-h-11 flex-wrap items-center justify-between gap-4">
              <mc-status-text
                label={`${items.length} ${items.length === 1 ? "imagen seleccionada" : "imágenes seleccionadas"}`}
                polite
                tone="idle"
              />
              <mc-button onClick={clearItems} size="sm" variant="ghost">
                Limpiar selección
              </mc-button>
            </div>
            <BatchPhotoPreviewGrid items={items} onRemove={removeItem} />
          </>
        ) : (
          <div className="border-mc-border-visible grid min-h-64 content-center justify-items-center gap-3 rounded-2xl border border-dashed p-8 text-center">
            <div className="admin-state-eyebrow">Sin selección</div>
            <h3 className="text-mc-text-display m-0">Las imágenes aparecerán aquí</h3>
            <p className="text-mc-text-secondary m-0">
              El título inicial se obtiene automáticamente del nombre de cada archivo.
            </p>
          </div>
        )}

        <footer className="border-mc-border-visible bg-mc-background-translucent sticky bottom-0 z-2 flex flex-wrap items-center justify-between gap-4 border-t py-4 backdrop-blur-md">
          <div className="grid gap-2">
            <div className="admin-kicker">Siguiente paso</div>
            <p className="text-mc-text-secondary m-0">
              La integración con el servicio de subida se añadirá por separado.
            </p>
          </div>
          <mc-button
            disabled={items.length === 0}
            onClick={() => {
              setShowIntegrationNotice(true);
            }}
            variant="primary"
          >
            Subir fotos
          </mc-button>
        </footer>

        {showIntegrationNotice ? (
          <mc-inline-message
            message={`${items.length} ${items.length === 1 ? "foto está preparada" : "fotos están preparadas"}. No se ha enviado ningún archivo.`}
            title="Lote listo para integrar"
            tone="success"
          />
        ) : null}
      </section>
    </div>
  );
}
