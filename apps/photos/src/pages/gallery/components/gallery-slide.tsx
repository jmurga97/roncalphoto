import type { GalleryPhotoViewModel } from "../types";
import { GalleryCard } from "./gallery-card";

interface GallerySlideProps {
  loading?: "lazy";
  photo: GalleryPhotoViewModel;
}

export function GallerySlide({ loading, photo }: GallerySlideProps) {
  return (
    <GalleryCard photoId={photo.id}>
      <img
        alt={photo.alt}
        className="max-h-full max-w-full object-contain"
        decoding="async"
        loading={loading}
        src={photo.imageSrc}
      />
    </GalleryCard>
  );
}
