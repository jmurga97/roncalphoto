import { useQuery } from "@tanstack/react-query";
import { imageResourceQueryOptions } from "../image-query-options";
import type { GalleryPhotoViewModel } from "../types";
import { GalleryPhotoLoader } from "./gallery-photo-loader";

interface GalleryThumbnailProps {
  buttonRef: (element: HTMLButtonElement | null) => void;
  isActive: boolean;
  onSelect: () => void;
  photo: GalleryPhotoViewModel;
}

export function GalleryThumbnail({ buttonRef, isActive, onSelect, photo }: GalleryThumbnailProps) {
  const thumbnailQuery = useQuery(imageResourceQueryOptions(photo.thumbnailSrc));

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onSelect}
      className={[
        "h-full w-full cursor-pointer overflow-hidden rounded border-2 transition-all duration-200 focus:outline-none",
        isActive ? "scale-105 opacity-100" : "border-transparent opacity-60 hover:opacity-100",
      ].join(" ")}
      style={
        isActive
          ? {
              borderColor: "var(--color-accent)",
              boxShadow: "0 0 0 2px color-mix(in srgb, var(--color-accent) 24%, transparent)",
            }
          : {
              borderColor: "transparent",
            }
      }
      aria-label={`Ver foto: ${photo.alt}`}
      aria-current={isActive ? "true" : undefined}
    >
      {thumbnailQuery.isSuccess ? (
        <img
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          src={photo.thumbnailSrc}
        />
      ) : (
        <GalleryPhotoLoader size="md" />
      )}
    </button>
  );
}
