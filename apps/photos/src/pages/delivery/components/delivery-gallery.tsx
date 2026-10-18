import { GalleryView } from "@/pages/gallery";

import { useDeliveryGalleryData } from "../hooks/use-delivery-gallery-data";

import type { DeliveryPhotoViewModel } from "../types";

interface DeliveryGalleryProps {
  photos: DeliveryPhotoViewModel[];
  title: string;
  token: string;
  activePhotoId: string;
  onSelectPhoto: (photoId?: string) => void;
}

export function DeliveryGallery({ photos, title, token, activePhotoId, onSelectPhoto }: DeliveryGalleryProps) {
  const galleryData = useDeliveryGalleryData(photos, title, token, activePhotoId, onSelectPhoto);

  // Same immersive viewer as the public session page, minus the thumbnail strip.
  return <GalleryView galleryData={galleryData} showThumbnails={false} />;
}
