import { Button, Field, InlineMessage, Select, StatusText } from "@jmurga97/components";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { EmptyState } from "@components/empty-state";
import { PageHeader } from "@components/page-header";
import { BatchImagePicker } from "@components/photos/batch-image-picker";
import { BatchPhotoPreviewGrid } from "@components/photos/batch-photo-preview-grid";
import { invalidatePortfolio, trpc } from "@lib/api/client";
import { createBatchImagePreview, revokeBatchImagePreview } from "@lib/photos/batch-images";
import { usePhotoUpload } from "@lib/photos/use-photo-upload";
import { getErrorMessage } from "@utils/get-error-message";

import type { BatchImageFile } from "@lib/photos/batch-images";

export function PhotoUploadView() {
  const { data: sessions } = useSuspenseQuery(trpc.sessions.list.queryOptions());
  const [items, setItems] = useState<BatchImageFile[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [sessionSelectOpen, setSessionSelectOpen] = useState(false);
  const [sessionLocked, setSessionLocked] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const uploadPhoto = usePhotoUpload();
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
    if (uploading) return;
    setItems((currentItems) => [...currentItems, ...files.map((item) => createBatchImagePreview(item))]);
  };

  const removeItem = (id: string) => {
    if (uploading) return;
    setItems((currentItems) => {
      const removedItem = currentItems.find((item) => item.id === id);

      if (removedItem) {
        revokeBatchImagePreview(removedItem);
      }

      return currentItems.filter((item) => item.id !== id);
    });
    if (items.length === 1) setSessionLocked(false);
    setErrors((current) => {
      const remaining = { ...current };
      delete remaining[id];
      return remaining;
    });
  };

  const clearItems = () => {
    items.forEach((item) => {
      revokeBatchImagePreview(item);
    });
    setItems([]);
    setErrors({});
    setSessionLocked(false);
    setProgress("");
  };

  const uploadItems = async () => {
    if (uploading || !selectedSessionId || items.length === 0) return;
    setUploading(true);
    setSessionLocked(true);
    setErrors({});
    let uploaded = 0;

    try {
      for (const [index, item] of items.entries()) {
        setProgress(`Subiendo ${index + 1} de ${items.length}: ${item.fileName}`);
        try {
          await uploadPhoto(item, selectedSessionId);
          uploaded += 1;
          revokeBatchImagePreview(item);
          setItems((current) => current.filter((file) => file.id !== item.id));
        } catch (error) {
          setErrors((current) => ({ ...current, [item.id]: getErrorMessage(error) }));
        }
      }
      setProgress(`${uploaded} de ${items.length} ${items.length === 1 ? "foto subida" : "fotos subidas"}`);
      if (uploaded === items.length) {
        setSessionLocked(false);
      }
      await invalidatePortfolio();
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!uploading) return;
    const beforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [uploading]);

  let sessionHint = sessionLocked
    ? "La sesión se conserva para reintentar sin duplicar las fotos"
    : "Todas las fotos del lote se guardarán en esta sesión";
  if (sessions.length === 0) sessionHint = "Crea una sesión antes de subir fotos";
  const resultTone = Object.keys(errors).length > 0 ? "error" : "success";

  return (
    <div className="ming-page">
      <PageHeader title="Subir fotos" description="Selecciona una sesión y sube tus imágenes." />

      <InlineMessage
        title="Contenido de las fotos"
        message="El nombre del archivo se usará como texto alternativo y descripción. Puedes editarlos después de subir la foto."
      />
      <section className="grid gap-ming-5" aria-labelledby="photo-upload-title">
        <fieldset className="m-0 min-w-0 border-0 p-0" disabled={uploading}>
          <BatchImagePicker
            kicker="Selección"
            onFilesAccepted={addFiles}
            title="Añadir imágenes"
            titleId="photo-upload-title"
          />
        </fieldset>

        <section className="admin-editor-section">
          <div className="admin-form-grid">
            <Field hint={sessionHint} label="Sesión" required>
              <Select
                disabled={uploading || sessionLocked}
                required
                onValueChange={(value) => {
                  setSelectedSessionId(value ?? "");
                  setSessionSelectOpen(false);
                }}
                onOpenChange={setSessionSelectOpen}
                open={sessionSelectOpen}
                options={sessionOptions}
                placeholder="Seleccionar sesión"
                value={selectedSessionId.length > 0 ? selectedSessionId : null}
              />
            </Field>
            {selectedSessionId.length > 0 ? (
              <Button
                disabled={uploading || sessionLocked}
                onClick={() => {
                  setSelectedSessionId("");
                }}
                size="sm"
                variant="ghost"
              >
                Quitar sesión
              </Button>
            ) : null}
          </div>
        </section>

        {items.length > 0 ? (
          <>
            <div className="flex min-h-11 flex-wrap items-center justify-between gap-ming-4">
              <StatusText
                label={`${items.length} ${items.length === 1 ? "imagen seleccionada" : "imágenes seleccionadas"}`}
                polite
                tone="neutral"
              />
              <Button disabled={uploading} onClick={clearItems} size="sm" variant="ghost">
                Limpiar selección
              </Button>
            </div>
            <fieldset className="m-0 min-w-0 border-0 p-0" disabled={uploading}>
              <BatchPhotoPreviewGrid items={items} onRemove={removeItem} />
            </fieldset>
            {items
              .filter((item) => errors[item.id])
              .map((item) => (
                <InlineMessage key={item.id} title={item.fileName} message={errors[item.id]} tone="error" />
              ))}
          </>
        ) : (
          <EmptyState title="Sin imágenes" description="Selecciona los archivos que quieres subir a una sesión." />
        )}

        <footer className="admin-upload-actions">
          <div className="grid gap-ming-2">
            <div className="admin-kicker">Subida de fotos</div>
            <p className="text-muted-foreground m-0">
              Las fotos aparecerán en la sesión cuando termine el procesamiento.
            </p>
            {progress ? <StatusText label={progress} tone={uploading ? "info" : resultTone} /> : null}
          </div>
          <Button
            disabled={uploading || items.length === 0 || !selectedSessionId}
            onClick={() => {
              void uploadItems();
            }}
            variant="primary"
          >
            {uploading ? "Subiendo fotos…" : "Subir fotos"}
          </Button>
        </footer>
      </section>
    </div>
  );
}
