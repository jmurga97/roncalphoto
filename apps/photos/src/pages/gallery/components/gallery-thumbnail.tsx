import type { GalleryPhotoViewModel } from "../types";

interface GalleryThumbnailProps {
  isActive: boolean;
  onSelect: () => void;
  photo: GalleryPhotoViewModel;
}

export function GalleryThumbnail({ isActive, onSelect, photo }: GalleryThumbnailProps) {
  return (
    <button
      data-gallery-thumbnail-id={photo.id}
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
      <img
        alt=""
        className={[
          "h-full w-full object-cover transition-[filter] duration-200",
          isActive ? "grayscale-0" : "grayscale",
        ].join(" ")}
        decoding="async"
        loading="eager"
        src={photo.thumbnailSrc}
      />
    </button>
  );
}
