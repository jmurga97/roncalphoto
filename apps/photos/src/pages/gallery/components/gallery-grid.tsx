import { useEffect } from "react";
import { createPortal } from "react-dom";

import { GalleryNextPhotoPeek } from "./gallery-next-photo-peek";
import { GalleryScrollHint } from "./gallery-scroll-hint";
import { GallerySlide } from "./gallery-slide";
import { GalleryThumbnail } from "./gallery-thumbnail";

import type { GalleryPhotoViewModel } from "../types";
import type { RefObject } from "react";

interface GalleryGridProps {
  containerRef: RefObject<HTMLDivElement | null>;
  currentIndex: number;
  galleryKey: string;
  onSelectPhoto: (photoId: string) => void;
  photoLayout?: string;
  photos: GalleryPhotoViewModel[];
  sessionTitle: string;
  showThumbnails: boolean;
  showTitle: boolean;
  // When set, the thumbnails render as a grid inside this element instead of a bottom strip.
  thumbnailsTarget?: HTMLElement | null;
  transitionPhotoId?: string;
}

export function GalleryGrid({
  containerRef,
  currentIndex,
  galleryKey,
  onSelectPhoto,
  photoLayout,
  photos,
  sessionTitle,
  showThumbnails,
  showTitle,
  thumbnailsTarget,
  transitionPhotoId,
}: GalleryGridProps) {
  // Keeps the active thumbnail in view inside an external (scrollable) thumbnails host.
  useEffect(() => {
    const active = thumbnailsTarget?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!active || !thumbnailsTarget) return;

    const host = thumbnailsTarget.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    if (item.top < host.top) thumbnailsTarget.scrollTo({ top: thumbnailsTarget.scrollTop - (host.top - item.top) });
    else if (item.bottom > host.bottom)
      thumbnailsTarget.scrollTo({ top: thumbnailsTarget.scrollTop + (item.bottom - host.bottom) });
  }, [currentIndex, thumbnailsTarget]);

  const renderThumbnails = (itemClassName: string) =>
    photos.map((photo, index) => (
      <div className={itemClassName} key={`${photo.id}-thumbnail`}>
        <GalleryThumbnail isActive={index === currentIndex} onSelect={() => onSelectPhoto(photo.id)} photo={photo} />
      </div>
    ));

  return (
    <div data-gallery-root className="photo-stage flex h-full flex-col">
      <div className="relative min-h-0 w-full flex-1">
        {showTitle ? (
          <header className="pointer-events-none absolute top-[calc(1.75rem+env(safe-area-inset-top,0px))] left-3 right-3 z-10 md:hidden">
            <h1 className="editorial-heading line-clamp-2 text-balance text-base leading-tight [text-shadow:0_1px_10px_rgb(0_0_0_/_0.14)] sm:text-lg">
              {sessionTitle}
            </h1>
          </header>
        ) : null}
        <div
          ref={containerRef}
          className="scrollbar-hide h-full w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory"
        >
          {photos.map((photo, index) => (
            <GallerySlide
              isTransitionTarget={photo.id === transitionPhotoId}
              key={photo.id}
              isActive={index === currentIndex}
              layout={photo.id === transitionPhotoId ? photoLayout : undefined}
              photo={photo}
              shouldLoad={Math.abs(index - currentIndex) <= 1}
            />
          ))}
        </div>

        {showThumbnails ? null : (
          <GalleryNextPhotoPeek currentPosition={currentIndex + 1} totalPhotos={photos.length} />
        )}
        <GalleryScrollHint galleryKey={galleryKey} photoCount={photos.length} />
      </div>

      {showThumbnails && thumbnailsTarget
        ? createPortal(
            <nav aria-label="Miniaturas de fotos" className="grid grid-cols-4 gap-2">
              {renderThumbnails("aspect-square")}
            </nav>,
            thumbnailsTarget,
          )
        : null}

      {showThumbnails && !thumbnailsTarget ? (
        <nav
          aria-label="Miniaturas de fotos"
          className="flex-[0.15] overflow-hidden border-t bg-[color:color-mix(in_srgb,var(--color-surface)_36%,transparent)] ui-divider"
        >
          <div className="scrollbar-hide flex h-full gap-2 overflow-x-auto overflow-y-hidden p-2 snap-x snap-mandatory">
            {renderThumbnails("aspect-square h-full shrink-0 snap-center")}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
