import { useMemo } from "react";

import { resolveGallerySelection } from "@/pages/gallery/utils/resolve-gallery-selection";

import type { DeliveryPhotoViewModel } from "../types";
import type { GalleryData } from "@/pages/gallery/types";

/**
 * Adapts delivery photos into the route-agnostic GalleryData contract consumed
 * by the shared session GalleryView, tracking the active photo in parent state
 * instead of the URL (a delivery has no per-photo route).
 */
export function useDeliveryGalleryData(
  photos: DeliveryPhotoViewModel[],
  title: string,
  token: string,
  activePhotoId: string,
  setPhotoId: GalleryData["setPhotoId"],
): GalleryData {
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

  const selection = useMemo(
    () => resolveGallerySelection(galleryPhotos, activePhotoId),
    [activePhotoId, galleryPhotos],
  );

  return {
    photos: galleryPhotos,
    selection,
    setPhotoId,
    sessionSlug: token,
    sessionTitle: title,
  };
}
