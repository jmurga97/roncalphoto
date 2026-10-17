import { useMutation, useQueryClient } from "@tanstack/react-query";

import { trpc } from "@lib/api/client";

import type { BatchImageFile } from "./batch-images";
import type { RouterInputs, RouterOutputs } from "@roncal/api/router";

async function uploadOriginal(file: File, upload: NonNullable<RouterOutputs["photoUploads"]["create"]["upload"]>) {
  const response = await fetch(upload.url, {
    method: "PUT",
    headers: upload.headers,
    body: file,
    credentials: "omit",
    signal: AbortSignal.timeout(120_000),
  }).catch((error: unknown) => {
    throw new Error("No se pudo enviar la imagen. Comprueba tu conexión y reintenta.", {
      cause: error,
    });
  });

  if (!response.ok) {
    throw new Error(`No se pudo enviar la imagen (${response.status}). Reintenta la subida.`);
  }
}

export function usePhotoUpload() {
  const queryClient = useQueryClient();
  const create = useMutation(trpc.photoUploads.create.mutationOptions({ retry: false }));
  const retry = useMutation(trpc.photoUploads.retry.mutationOptions({ retry: false }));

  return async (item: BatchImageFile, sessionId: string) => {
    const contentType = item.file.type;

    if (contentType !== "image/jpeg" && contentType !== "image/png" && contentType !== "image/webp") {
      throw new Error("Selecciona una imagen JPEG, PNG o WebP.");
    }

    const data: RouterInputs["photoUploads"]["create"]["data"] = {
      sessionId,
      alt: item.title.trim() || item.fileName,
      about: item.title.trim() || item.fileName,
      filename: item.fileName,
      contentType,
      sizeBytes: item.fileSize,
    };
    const created = await create.mutateAsync({ idempotencyKey: item.id, data });

    if (created.status === "awaiting_upload") {
      if (!created.upload) throw new Error("No se ha recibido la dirección de subida. Reintenta.");

      await uploadOriginal(item.file, created.upload);
    }

    if (created.status === "failed") {
      await retry.mutateAsync({ uploadId: created.uploadId });
    }

    const deadline = Date.now() + 180_000;

    while (Date.now() < deadline) {
      const upload = await queryClient.fetchQuery({
        ...trpc.photoUploads.get.queryOptions({ uploadId: created.uploadId }),
        staleTime: 0,
        retry: false,
      });

      if (upload.status === "succeeded") {
        if (!upload.photo) throw new Error("La foto ya no existe. Quita el archivo y añádelo de nuevo.");

        return upload.photo;
      }

      if (upload.status === "failed") {
        throw new Error(upload.error?.message ?? "No se pudo procesar la imagen. Reintenta.");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error("La imagen sigue procesándose. Reintenta para comprobar el resultado.");
  };
}
