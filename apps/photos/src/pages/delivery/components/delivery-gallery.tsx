import { GalleryView } from "@/pages/gallery";

import { useDeliveryGalleryData } from "../hooks/use-delivery-gallery-data";

import type { DeliveryPhotoViewModel } from "../types";

interface DeliveryGalleryProps {
  photos: DeliveryPhotoViewModel[];
  title: string;
  token: string;
  initialPhotoId?: string;
}

export function DeliveryGallery({ photos, title, token, initialPhotoId }: DeliveryGalleryProps) {
  const galleryData = useDeliveryGalleryData(photos, title, token, initialPhotoId);

  // Same immersive viewer as the public session page, minus the thumbnail strip.
  return <GalleryView galleryData={galleryData} showThumbnails={false} />;
}
