import type { RefObject } from "react";
import type { GalleryPhotoViewModel } from "../types";
import { GallerySlide } from "./gallery-slide";
import { GalleryThumbnail } from "./gallery-thumbnail";

interface GalleryGridProps {
  containerRef: RefObject<HTMLDivElement | null>;
  currentIndex: number;
  onSelectPhoto: (photoId: string) => void;
  photos: GalleryPhotoViewModel[];
  showThumbnails: boolean;
}

export function GalleryGrid({
  containerRef,
  currentIndex,
  onSelectPhoto,
  photos,
  showThumbnails,
}: GalleryGridProps) {
  return (
    <div data-gallery-root className="photo-stage gallery-enter flex h-full flex-col">
      <div
        ref={containerRef}
        className="scrollbar-hide h-full w-full flex-1 overflow-y-auto overflow-x-hidden snap-y snap-mandatory"
      >
        {photos.map((photo, index) => (
          <GallerySlide
            isActive={index === currentIndex}
            isWarm={Math.abs(index - currentIndex) <= 1}
            key={photo.id}
            photo={photo}
          />
        ))}
      </div>

      {showThumbnails ? (
        <nav
          aria-label="Miniaturas de fotos"
          className="flex-[0.15] overflow-hidden border-t ui-divider"
          style={{ background: "color-mix(in srgb, var(--color-surface) 36%, transparent)" }}
        >
          <div className="scrollbar-hide flex h-full gap-2 overflow-x-auto overflow-y-hidden p-2 snap-x snap-mandatory">
            {photos.map((photo, index) => (
              <div
                className="aspect-square h-full shrink-0 snap-center"
                key={`${photo.id}-thumbnail`}
              >
                <GalleryThumbnail
                  isActive={index === currentIndex}
                  onSelect={() => onSelectPhoto(photo.id)}
                  photo={photo}
                />
              </div>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
