import { useSuspenseQuery } from "@tanstack/react-query";
import { imageResourceQueryOptions } from "../image-query-options";

interface GalleryPhotoImageProps {
  alt: string;
  imageSrc: string;
}

export function GalleryPhotoImage({ alt, imageSrc }: GalleryPhotoImageProps) {
  // This query is only here to suspend until preloadImage resolves for the active photo.
  useSuspenseQuery(imageResourceQueryOptions(imageSrc));

  return (
    <img
      alt={alt}
      className="max-h-full max-w-full object-contain"
      loading="eager"
      src={imageSrc}
    />
  );
}
