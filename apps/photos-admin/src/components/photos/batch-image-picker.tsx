import { useEffect, useState } from "react";

import { ACCEPTED_IMAGE_ACCEPT, partitionImageFiles } from "@lib/photos/batch-images";

interface BatchImagePickerProps {
  description?: string;
  kicker: string;
  onFilesAccepted: (files: File[]) => void;
  resetRejectedKey?: string | number;
  title: string;
  titleId?: string;
}

export function BatchImagePicker({
  description = "JPEG, PNG o WebP. Máximo 25 MiB por archivo.",
  kicker,
  onFilesAccepted,
  resetRejectedKey,
  title,
  titleId,
}: BatchImagePickerProps) {
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);

  useEffect(() => {
    setRejectedFiles([]);
  }, [resetRejectedKey]);

  return (
    <>
      <div className="border-mc-border-visible bg-mc-surface flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5">
        <div className="grid gap-2">
          <div className="admin-kicker">{kicker}</div>
          <h3 id={titleId} className="text-mc-text-display m-0">
            {title}
          </h3>
          <p className="text-mc-text-secondary m-0">{description}</p>
        </div>
        <label className="border-mc-accent bg-mc-accent focus-within:outline-mc-text-display relative inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-4 py-3 font-semibold text-white focus-within:outline-2 focus-within:outline-offset-3 max-sm:w-full">
          <span>Seleccionar archivos</span>
          <input
            className="absolute size-px opacity-0"
            accept={ACCEPTED_IMAGE_ACCEPT}
            multiple
            onChange={(event) => {
              const { validFiles, rejectedFiles: nextRejectedFiles } = partitionImageFiles(
                event.currentTarget.files,
              );

              if (validFiles.length > 0) {
                onFilesAccepted(validFiles);
              }

              setRejectedFiles(nextRejectedFiles.map((file) => file.name));
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
    </>
  );
}
