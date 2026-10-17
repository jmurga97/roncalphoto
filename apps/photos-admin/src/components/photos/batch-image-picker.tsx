import { Button } from "@jmurga97/components";
import { useRef } from "react";
import { toast } from "sonner";

import { ACCEPTED_IMAGE_ACCEPT, partitionImageFiles } from "@lib/photos/batch-images";

interface BatchImagePickerProps {
  description?: string;
  kicker?: string;
  onFilesAccepted: (files: File[]) => void;
  title?: string;
  titleId?: string;
}

export function BatchImagePicker({
  description = "JPEG, PNG o WebP. Máximo 25 MiB por imagen.",
  onFilesAccepted,
  title = "Añadir imágenes",
  titleId,
}: BatchImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="ming-stack">
      <div className="ming-cluster ming-cluster--between">
        <div className="ming-stack ming-stack--tight">
          <h2 id={titleId} className="ming-section__title">
            {title}
          </h2>
          <p className="admin-copy">{description}</p>
        </div>
        <Button variant="secondary" onClick={() => inputRef.current?.click()}>
          Seleccionar archivos
        </Button>
        <input
          ref={inputRef}
          className="admin-file-input"
          aria-label="Archivos de imagen"
          tabIndex={-1}
          accept={ACCEPTED_IMAGE_ACCEPT}
          multiple
          type="file"
          onChange={(event) => {
            const { validFiles, rejectedFiles: rejected } = partitionImageFiles(event.currentTarget.files);
            if (validFiles.length > 0) onFilesAccepted(validFiles);
            if (rejected.length > 0) {
              toast.error("Algunos archivos no son válidos", {
                description: `No se añadieron: ${rejected.map((file) => file.name).join(", ")}. Revisa el formato o el límite de 25 MiB.`,
              });
            }
            event.currentTarget.value = "";
          }}
        />
      </div>
    </div>
  );
}
