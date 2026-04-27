export interface GalleryPhotoViewModel {
  alt: string;
  id: string;
  imageSrc: string;
  thumbnailSrc: string;
}

export interface GallerySelection {
  currentIndex: number;
  isSelectionValid: boolean;
  normalizedPhotoId?: string;
}

export interface GalleryData {
  photos: GalleryPhotoViewModel[];
  selection: GallerySelection;
  setPhotoId: (photoId?: string) => void;
  sessionSlug: string;
}
