import { Suspense } from "react";
import type { GalleryPhotoViewModel } from "../types";
import { GalleryCard } from "./gallery-card";
import { GalleryPhotoImage } from "./gallery-photo-image";
import { GalleryPhotoLoader } from "./gallery-photo-loader";

interface GallerySlideProps {
  isActive: boolean;
  isWarm: boolean;
  photo: GalleryPhotoViewModel;
}

export function GallerySlide({ isActive, isWarm, photo }: GallerySlideProps) {
  return (
    <GalleryCard photoId={photo.id}>
      {isActive ? (
        <Suspense fallback={<GalleryPhotoLoader />}>
          <GalleryPhotoImage alt={photo.alt} imageSrc={photo.imageSrc} />
        </Suspense>
      ) : isWarm ? (
        <img
          alt={photo.alt}
          className="max-h-full max-w-full object-contain"
          decoding="async"
          loading="eager"
          src={photo.imageSrc}
        />
      ) : null}
    </GalleryCard>
  );
}
