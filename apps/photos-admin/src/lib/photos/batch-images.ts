export const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const ACCEPTED_IMAGE_ACCEPT = Array.from(ACCEPTED_IMAGE_TYPES).join(",");
export const MAX_IMAGE_FILE_SIZE = 25 * 1024 * 1024;

export interface BatchImagePreview {
  id: string;
  previewUrl: string;
  fileName: string;
  fileSize: number;
  title: string;
}

export interface BatchImageFile extends BatchImagePreview {
  file: File;
}

export function getTitleFromFilename(filename: string) {
  return filename.replace(/\.[^/.]+$/, "");
}

export function formatImageFileSize(sizeBytes: number) {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 1,
    style: "unit",
    unit: "megabyte",
    unitDisplay: "short",
  }).format(sizeBytes / (1024 * 1024));
}

export function isAcceptedImageFile(file: File) {
  return ACCEPTED_IMAGE_TYPES.has(file.type) && file.size <= MAX_IMAGE_FILE_SIZE;
}

export function partitionImageFiles(fileList: FileList | File[] | null) {
  const selectedFiles = Array.from(fileList ?? []);

  return {
    validFiles: selectedFiles.filter(isAcceptedImageFile),
    rejectedFiles: selectedFiles.filter((file) => !isAcceptedImageFile(file)),
  };
}

export function createBatchImagePreview(file: File): BatchImageFile {
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    fileName: file.name,
    fileSize: file.size,
    title: getTitleFromFilename(file.name),
  };
}

export function revokeBatchImagePreview(item: Pick<BatchImagePreview, "previewUrl">) {
  URL.revokeObjectURL(item.previewUrl);
}
