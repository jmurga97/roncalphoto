import type { RefObject } from "react";
import type { GalleryPhotoViewModel } from "../types";
import { GallerySlide } from "./gallery-slide";
import { GalleryThumbnail } from "./gallery-thumbnail";

interface GalleryGridProps {
  containerRef: RefObject<HTMLDivElement | null>;
  currentIndex: number;
  onContainerScroll: () => void;
  onUserScrollIntent: () => void;
  onSelectPhoto: (index: number) => void;
  photos: GalleryPhotoViewModel[];
  registerSlide: (index: number) => (element: HTMLElement | null) => void;
  registerThumbnail: (index: number) => (element: HTMLButtonElement | null) => void;
  showThumbnails: boolean;
}

export function GalleryGrid({
  containerRef,
  currentIndex,
  onContainerScroll,
  onUserScrollIntent,
  onSelectPhoto,
  photos,
  registerSlide,
  registerThumbnail,
  showThumbnails,
}: GalleryGridProps) {
  return (
    <div className="photo-stage gallery-enter flex h-full flex-col">
      <div
        ref={containerRef}
        className="scrollbar-hide h-full w-full flex-1 overflow-y-auto overflow-x-hidden snap-y snap-mandatory"
        onScroll={() => onContainerScroll()}
        onPointerDownCapture={() => onUserScrollIntent()}
        onTouchMoveCapture={() => onUserScrollIntent()}
        onWheelCapture={() => onUserScrollIntent()}
      >
        {photos.map((photo, index) => (
          <GallerySlide
            isActive={index === currentIndex}
            isWarm={Math.abs(index - currentIndex) <= 1}
            key={photo.id}
            photo={photo}
            slideRef={registerSlide(index)}
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
                  buttonRef={registerThumbnail(index)}
                  isActive={index === currentIndex}
                  onSelect={() => onSelectPhoto(index)}
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
