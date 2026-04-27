import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { imageResourceQueryOptions } from "../image-query-options";
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
  const imageQuery = useQuery({
    ...imageResourceQueryOptions(photo.imageSrc),
    enabled: !isActive && isWarm,
  });

  return (
    <GalleryCard photoId={photo.id}>
      {isActive ? (
        <Suspense fallback={<GalleryPhotoLoader />}>
          <GalleryPhotoImage alt={photo.alt} imageSrc={photo.imageSrc} />
        </Suspense>
      ) : imageQuery.isSuccess ? (
        <img
          alt={photo.alt}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
          src={photo.imageSrc}
        />
      ) : (
        <GalleryPhotoLoader />
      )}
    </GalleryCard>
  );
}
