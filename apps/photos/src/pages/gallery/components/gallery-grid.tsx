import type { RefObject } from "react";
import type { GalleryPhotoViewModel } from "../types";
import { GalleryNextPhotoPeek } from "./gallery-next-photo-peek";
import { GalleryScrollHint } from "./gallery-scroll-hint";
import { GallerySlide } from "./gallery-slide";
import { GalleryThumbnail } from "./gallery-thumbnail";

interface GalleryGridProps {
  containerRef: RefObject<HTMLDivElement | null>;
  currentIndex: number;
  onSelectPhoto: (photoId: string) => void;
  photos: GalleryPhotoViewModel[];
  sessionTitle: string;
  showThumbnails: boolean;
}

export function GalleryGrid({
  containerRef,
  currentIndex,
  onSelectPhoto,
  photos,
  sessionTitle,
  showThumbnails,
}: GalleryGridProps) {
  return (
    <div data-gallery-root className="photo-stage gallery-enter flex h-full flex-col">
      <div className="relative min-h-0 w-full flex-1">
        <header className="pointer-events-none absolute top-7 left-3 right-20 z-10 md:hidden">
          <h1 className="editorial-heading line-clamp-2 text-balance text-base leading-tight [text-shadow:0_1px_10px_rgb(0_0_0_/_0.14)] sm:text-lg">
            {sessionTitle}
          </h1>
        </header>
        <div
          ref={containerRef}
          className="scrollbar-hide h-full w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory"
        >
          {photos.map((photo, index) => (
            <GallerySlide key={photo.id} loading={index === 0 ? undefined : "lazy"} photo={photo} />
          ))}
        </div>

        {!showThumbnails ? (
          <GalleryNextPhotoPeek currentPosition={currentIndex + 1} totalPhotos={photos.length} />
        ) : null}
        <GalleryScrollHint photoCount={photos.length} />
      </div>

      {showThumbnails ? (
        <nav
          aria-label="Miniaturas de fotos"
          className="flex-[0.15] overflow-hidden border-t bg-[color:color-mix(in_srgb,var(--color-surface)_36%,transparent)] ui-divider"
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
