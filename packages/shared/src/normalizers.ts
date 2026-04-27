import type { PhotoMetadata } from "./types";

interface NullablePhotoMetadata {
  iso?: number | null;
  aperture?: string | null;
  shutterSpeed?: string | null;
  lens?: string | null;
  camera?: string | null;
}

function normalizeText(value?: string | null): string {
  return value?.trim() ?? "";
}

/**
 * Normalizes nullable/partial metadata values into the canonical non-nullable domain shape.
 */
export function normalizePhotoMetadata(metadata?: NullablePhotoMetadata | null): PhotoMetadata {
  return {
    iso: metadata?.iso ?? 0,
    aperture: normalizeText(metadata?.aperture),
    shutterSpeed: normalizeText(metadata?.shutterSpeed),
    lens: normalizeText(metadata?.lens),
    camera: normalizeText(metadata?.camera),
  };
}
