import { useMemo, useState } from "react";

import type { DeliveryPhotoViewModel } from "../types";
import type { GalleryData } from "@/pages/gallery/types";

/**
 * Adapts delivery photos into the route-agnostic GalleryData contract consumed
 * by the shared session GalleryView, tracking the active photo in local state
 * instead of the URL (a delivery has no per-photo route).
 */
export function useDeliveryGalleryData(
  photos: DeliveryPhotoViewModel[],
  title: string,
  token: string,
  initialPhotoId?: string,
): GalleryData {
  const [activePhotoId, setActivePhotoId] = useState<string | undefined>(initialPhotoId);

  const galleryPhotos = useMemo(
    () =>
      photos.map((photo) => ({
        alt: photo.title,
        id: photo.id,
        imageSrc: photo.imageSrc,
        thumbnailSrc: photo.thumbnailSrc,
      })),
    [photos],
  );

  const selection = useMemo(() => {
    const index = galleryPhotos.findIndex((photo) => photo.id === activePhotoId);
    const currentIndex = index < 0 ? 0 : index;

    return {
      currentIndex,
      isSelectionValid: index >= 0,
      normalizedPhotoId: galleryPhotos[currentIndex]?.id,
    };
  }, [activePhotoId, galleryPhotos]);

  return {
    photos: galleryPhotos,
    selection,
    setPhotoId: setActivePhotoId,
    sessionSlug: token,
    sessionTitle: title,
  };
}
