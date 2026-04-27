import type { Photo } from "@roncal/shared";

export interface PhotoSelection {
  isValid: boolean;
  normalizedPhotoId?: string;
  selectedIndex: number;
  selectedPhoto?: Photo;
}

export function resolvePhotoSelection(photos: Photo[], photoId?: string): PhotoSelection {
  if (photos.length === 0) {
    return {
      isValid: photoId === undefined,
      selectedIndex: -1,
    };
  }

  if (!photoId) {
    return {
      isValid: false,
      selectedIndex: 0,
      selectedPhoto: photos[0],
      normalizedPhotoId: photos[0]?.id,
    };
  }

  const selectedIndex = photos.findIndex((photo) => photo.id === photoId);

  if (selectedIndex === -1) {
    return {
      isValid: false,
      selectedIndex: 0,
      selectedPhoto: photos[0],
      normalizedPhotoId: photos[0]?.id,
    };
  }

  return {
    isValid: true,
    selectedIndex,
    selectedPhoto: photos[selectedIndex],
    normalizedPhotoId: photos[selectedIndex]?.id,
  };
}
