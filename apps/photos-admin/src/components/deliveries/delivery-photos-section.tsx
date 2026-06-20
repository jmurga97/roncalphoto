import { useEffect, useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { FormTextInput } from "@components/forms/adapters/form-text-input";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@lib/deliveries/upload-form";

import type { DeliveryFormValues, DeliveryPhotoFormValue } from "@lib/deliveries/upload-form";

function getTitleFromFilename(filename: string) {
  return filename.replace(/\.[^/.]+$/, "");
}

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatFileSize(sizeBytes: number) {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 1,
    style: "unit",
    unit: "megabyte",
    unitDisplay: "short",
  }).format(sizeBytes / (1024 * 1024));
}

function toPhotoValue(file: File): DeliveryPhotoFormValue {
  return {
    id: crypto.randomUUID(),
    previewUrl: URL.createObjectURL(file),
    fileName: file.name,
    fileSize: file.size,
    title: getTitleFromFilename(file.name),
    date: getTodayIso(),
  };
}

export function DeliveryPhotosSection() {
  const { control } = useFormContext<DeliveryFormValues>();
  const { append, fields, remove } = useFieldArray({ control, name: "photos" });
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);

  const previewUrlsRef = useRef<string[]>([]);
  previewUrlsRef.current = fields.map((field) => field.previewUrl);

  useEffect(
    () => () => {
      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    },
    [],
  );

  const addFiles = (fileList: FileList | null) => {
    const selectedFiles = Array.from(fileList ?? []);
    const validFiles = selectedFiles.filter(
      (file) => ACCEPTED_IMAGE_TYPES.has(file.type) && file.size <= MAX_FILE_SIZE,
    );
    const invalidFiles = selectedFiles.filter(
      (file) => !ACCEPTED_IMAGE_TYPES.has(file.type) || file.size > MAX_FILE_SIZE,
    );

    if (validFiles.length > 0) {
      append(validFiles.map(toPhotoValue));
    }

    setRejectedFiles(invalidFiles.map((file) => file.name));
  };

  const removePhoto = (index: number) => {
    const url = fields[index]?.previewUrl;

    if (url) {
      URL.revokeObjectURL(url);
    }

    remove(index);
  };

  return (
    <section className="admin-editor-section">
      <div className="border-mc-border-visible bg-mc-surface flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5">
        <div className="grid gap-2">
          <div className="admin-kicker">Lote de imágenes</div>
          <h3 className="text-mc-text-display m-0">Añadir imágenes</h3>
          <p className="text-mc-text-secondary m-0">JPEG, PNG o WebP. Máximo 25 MiB por archivo.</p>
        </div>
        <label className="border-mc-accent bg-mc-accent focus-within:outline-mc-text-display relative inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-4 py-3 font-semibold text-white focus-within:outline-2 focus-within:outline-offset-3 max-sm:w-full">
          <span>Seleccionar archivos</span>
          <input
            className="absolute size-px opacity-0"
            accept="image/*"
            multiple
            onChange={(event) => {
              addFiles(event.currentTarget.files);
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

      {fields.length > 0 ? (
        <ul
          className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4 p-0"
          aria-label="Imágenes del lote"
        >
          {fields.map((field, index) => (
            <li
              key={field.id}
              className="border-mc-border bg-mc-surface grid min-w-0 gap-4 overflow-hidden rounded-[0.875rem] border p-4"
            >
              <div className="bg-mc-surface-raised aspect-4/3 overflow-hidden rounded-md">
                <img className="block size-full object-cover" alt="" src={field.previewUrl} />
              </div>
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
                <span title={field.fileName}>{formatFileSize(field.fileSize)}</span>
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
            </li>
          ))}
        </ul>
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
