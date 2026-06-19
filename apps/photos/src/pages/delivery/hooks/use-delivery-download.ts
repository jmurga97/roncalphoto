import { downloadZip } from "client-zip";
import { useCallback, useState } from "react";

import { triggerBlobDownload } from "../utils/trigger-blob-download";

import type { DeliveryPhotoViewModel } from "../types";

/**
 * Ensures every entry in a zip has a unique name, appending a numeric suffix to
 * collisions (e.g. two files both named "photo.jpg").
 */
function dedupeFilename(name: string, used: Set<string>): string {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }

  const dotIndex = name.lastIndexOf(".");
  const base = dotIndex > 0 ? name.slice(0, dotIndex) : name;
  const extension = dotIndex > 0 ? name.slice(dotIndex) : "";

  let counter = 1;
  let candidate = `${base}-${counter}${extension}`;
  while (used.has(candidate)) {
    counter += 1;
    candidate = `${base}-${counter}${extension}`;
  }

  used.add(candidate);
  return candidate;
}

export interface DeliveryDownload {
  isDownloading: boolean;
  error: string | null;
  downloadOne: (photo: DeliveryPhotoViewModel) => Promise<void>;
  downloadZipArchive: (photos: DeliveryPhotoViewModel[], archiveName: string) => Promise<void>;
}

export function useDeliveryDownload(): DeliveryDownload {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadOne = useCallback(async (photo: DeliveryPhotoViewModel) => {
    setIsDownloading(true);
    setError(null);
    try {
      const response = await fetch(photo.imageSrc);
      if (!response.ok) {
        throw new Error(`No se pudo descargar la foto (${response.status})`);
      }
      triggerBlobDownload(await response.blob(), photo.title);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo descargar la foto.");
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const downloadZipArchive = useCallback(
    async (photos: DeliveryPhotoViewModel[], archiveName: string) => {
      if (photos.length === 0) {
        return;
      }

      setIsDownloading(true);
      setError(null);
      try {
        const usedNames = new Set<string>();
        const entries = await Promise.all(
          photos.map(async (photo) => {
            const response = await fetch(photo.imageSrc);
            if (!response.ok) {
              throw new Error(`No se pudo descargar "${photo.title}" (${response.status})`);
            }
            return { name: dedupeFilename(photo.title, usedNames), input: await response.blob() };
          }),
        );

        const zipped = await downloadZip(entries).blob();
        triggerBlobDownload(zipped, archiveName);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo crear el archivo ZIP.");
      } finally {
        setIsDownloading(false);
      }
    },
    [],
  );

  return { isDownloading, error, downloadOne, downloadZipArchive };
}
