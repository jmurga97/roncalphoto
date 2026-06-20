import { McSelect } from "@murga.ing/components/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";

import { BatchImagePicker } from "@components/photos/batch-image-picker";
import { BatchPhotoPreviewGrid } from "@components/photos/batch-photo-preview-grid";
import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { createBatchImagePreview, revokeBatchImagePreview } from "@lib/photos/batch-images";

import type { BatchImageFile } from "@lib/photos/batch-images";

export function PhotoUploadView() {
  const { data: sessions } = useSuspenseQuery(sessionsListQueryOptions());
  const sessionSelectId = useId();
  const [items, setItems] = useState<BatchImageFile[]>([]);
  const [pickerResetKey, setPickerResetKey] = useState(0);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [sessionSelectOpen, setSessionSelectOpen] = useState(false);
  const [showIntegrationNotice, setShowIntegrationNotice] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const sessionOptions = sessions.map((session) => ({
    id: session.id,
    label: session.title,
    description: session.slug,
  }));

  useEffect(
    () => () => {
      itemsRef.current.forEach((item) => {
        revokeBatchImagePreview(item);
      });
    },
    [],
  );

  const addFiles = (files: File[]) => {
    setItems((currentItems) => [...currentItems, ...files.map(createBatchImagePreview)]);
    setShowIntegrationNotice(false);
  };

  const removeItem = (id: string) => {
    setItems((currentItems) => {
      const removedItem = currentItems.find((item) => item.id === id);

      if (removedItem) {
        revokeBatchImagePreview(removedItem);
      }

      return currentItems.filter((item) => item.id !== id);
    });
    setShowIntegrationNotice(false);
  };

  const clearItems = () => {
    items.forEach((item) => {
      revokeBatchImagePreview(item);
    });
    setItems([]);
    setPickerResetKey((currentKey) => currentKey + 1);
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
        <BatchImagePicker
          kicker="Selección"
          onFilesAccepted={addFiles}
          resetRejectedKey={pickerResetKey}
          title="Añadir imágenes"
          titleId="photo-upload-title"
        />

        <section className="admin-editor-section">
          <div className="admin-form-grid">
            <mc-field
              hint="Opcional. Puedes dejarlo vacío y asignar sesión más adelante desde el editor de cada foto."
              inputId={sessionSelectId}
              label="¿Quieres agregar estas fotos a una sesión?"
              optional
            >
              <div className="grid gap-3">
                <McSelect
                  inputId={sessionSelectId}
                  onMcChange={(event) => {
                    setSelectedSessionId(event.detail.selectedId ?? "");
                    setSessionSelectOpen(false);
                  }}
                  onMcOpenChange={(event) => {
                    setSessionSelectOpen(event.detail.open);
                  }}
                  open={sessionSelectOpen}
                  options={sessionOptions}
                  placeholder="Seleccionar sesión"
                  selectedId={selectedSessionId.length > 0 ? selectedSessionId : null}
                />
                {selectedSessionId.length > 0 ? (
                  <mc-button
                    onClick={() => {
                      setSelectedSessionId("");
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    Quitar sesión
                  </mc-button>
                ) : null}
              </div>
            </mc-field>
          </div>
        </section>

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
