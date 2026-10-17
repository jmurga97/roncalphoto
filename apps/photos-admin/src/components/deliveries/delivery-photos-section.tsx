import { Button } from "@jmurga97/components";
import { useEffect, useRef } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { EmptyState } from "@components/empty-state";
import { FormTextInput } from "@components/forms/adapters/form-text-input";
import { BatchImagePicker } from "@components/photos/batch-image-picker";
import { BatchPhotoPreviewGrid } from "@components/photos/batch-photo-preview-grid";
import { createBatchImagePreview, formatImageFileSize, revokeBatchImagePreview } from "@lib/photos/batch-images";

import type { DeliveryFormValues, DeliveryPhotoFormValue } from "@lib/deliveries/upload-form";

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

function toPhotoValue(file: File): DeliveryPhotoFormValue {
  const preview = createBatchImagePreview(file);

  return {
    id: preview.id,
    previewUrl: preview.previewUrl,
    fileName: preview.fileName,
    fileSize: preview.fileSize,
    title: preview.title,
    date: getTodayIso(),
  };
}

export function DeliveryPhotosSection() {
  const { control } = useFormContext<DeliveryFormValues>();
  const { append, fields, remove } = useFieldArray({ control, name: "photos" });

  const previewUrlsRef = useRef<string[]>([]);
  previewUrlsRef.current = fields.map((field) => field.previewUrl);

  useEffect(
    () => () => {
      previewUrlsRef.current.forEach((url) => {
        revokeBatchImagePreview({ previewUrl: url });
      });
    },
    [],
  );

  const addFiles = (files: File[]) => {
    append(files.map((item) => toPhotoValue(item)));
  };

  const removePhoto = (index: number) => {
    const url = fields[index]?.previewUrl;

    if (url) {
      revokeBatchImagePreview({ previewUrl: url });
    }

    remove(index);
  };

  return (
    <section className="admin-editor-section">
      <BatchImagePicker kicker="Lote de imágenes" onFilesAccepted={addFiles} title="Añadir imágenes" />

      {fields.length > 0 ? (
        <BatchPhotoPreviewGrid
          ariaLabel="Imágenes del lote"
          items={fields}
          onRemove={(_id, index) => {
            removePhoto(index);
          }}
          renderBody={(field, index) => (
            <>
              <FormTextInput<DeliveryFormValues>
                label="Título"
                name={`photos.${index}.title`}
                placeholder="Título de la foto"
                required
              />
              <FormTextInput<DeliveryFormValues> label="Fecha" name={`photos.${index}.date`} required type="date" />
              <div className="text-muted-foreground flex items-center justify-between gap-ming-3 text-[length:var(--admin-text-body-sm)]">
                <span title={field.fileName}>{formatImageFileSize(field.fileSize)}</span>
                <Button
                  aria-label={`Quitar ${field.fileName}`}
                  onClick={() => {
                    removePhoto(index);
                  }}
                  size="sm"
                  variant="ghost"
                >
                  Quitar
                </Button>
              </div>
            </>
          )}
        />
      ) : (
        <EmptyState
          title="Sin imágenes"
          description="Selecciona los archivos de la entrega. El título inicial se obtiene de su nombre."
        />
      )}
    </section>
  );
}
