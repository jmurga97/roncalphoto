import type { GallerySelection } from "../types";

// An unknown or missing id falls back to the first photo, flagged as not a valid selection.
export function resolveGallerySelection(photos: { id: string }[], photoId?: string): GallerySelection {
  const index = photoId ? photos.findIndex((photo) => photo.id === photoId) : -1;
  const currentIndex = Math.max(index, 0);

  return { currentIndex, isSelectionValid: index !== -1, normalizedPhotoId: photos[currentIndex]?.id };
}
