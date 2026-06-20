import { useEffect, useRef } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { FormTextInput } from "@components/forms/adapters/form-text-input";
import { BatchImagePicker } from "@components/photos/batch-image-picker";
import { BatchPhotoPreviewGrid } from "@components/photos/batch-photo-preview-grid";
import {
  createBatchImagePreview,
  formatImageFileSize,
  revokeBatchImagePreview,
} from "@lib/photos/batch-images";

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
    append(files.map(toPhotoValue));
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
      <BatchImagePicker
        kicker="Lote de imágenes"
        onFilesAccepted={addFiles}
        title="Añadir imágenes"
      />

      {fields.length > 0 ? (
        <BatchPhotoPreviewGrid
          ariaLabel="Imágenes del lote"
          contentClassName="grid gap-4"
          gridClassName="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4 p-0"
          imageClassName="bg-mc-surface-raised aspect-4/3 overflow-hidden rounded-md"
          itemClassName="border-mc-border bg-mc-surface grid min-w-0 gap-4 overflow-hidden rounded-[0.875rem] border p-4"
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
              <FormTextInput<DeliveryFormValues>
                label="Fecha"
                name={`photos.${index}.date`}
                required
                type="date"
              />
              <div className="text-mc-text-secondary flex items-center justify-between gap-3 text-[0.8125rem]">
                <span title={field.fileName}>{formatImageFileSize(field.fileSize)}</span>
                <mc-button
                  aria-label={`Quitar ${field.fileName}`}
                  onClick={() => {
                    removePhoto(index);
                  }}
                  size="sm"
                  variant="ghost"
                >
                  Quitar
                </mc-button>
              </div>
            </>
          )}
        />
      ) : (
        <div className="border-mc-border-visible grid min-h-48 content-center justify-items-center gap-3 rounded-2xl border border-dashed p-8 text-center">
          <div className="admin-state-eyebrow">Sin selección</div>
          <h3 className="text-mc-text-display m-0">Las imágenes aparecerán aquí</h3>
          <p className="text-mc-text-secondary m-0">
            El título inicial se obtiene del nombre de cada archivo.
          </p>
        </div>
      )}
    </section>
  );
}
