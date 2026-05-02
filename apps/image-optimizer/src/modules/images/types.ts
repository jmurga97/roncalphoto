export const WEBP_MIME_TYPE = "image/webp";

export const acceptedImageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export type AcceptedImageMimeType = (typeof acceptedImageMimeTypes)[number];
export type ImageFit = "scale-down" | "contain" | "cover" | "crop" | "pad" | "squeeze";

export interface ImageProfile {
  width: number;
  fit: ImageFit;
  quality: number;
}

export interface ImageInfo {
  format: string;
  fileSize: number;
  width: number;
  height: number;
}

export interface TransformedImage {
  bytes: ArrayBuffer;
  contentType: string;
}
