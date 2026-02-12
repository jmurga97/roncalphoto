import { useEffect, useCallback, type ReactNode, type RefObject } from "react";
import { useGallery } from "./context/GalleryContext";
import { Thumbnail } from "./Thumbnail";
import { scrollToPhoto } from "./context/Gallery";

interface PhotoCarouselProps {
  mainContainerRef: RefObject<HTMLDivElement | null>;
  desktopRef: RefObject<HTMLDivElement | null>;
}

// Utility function to scroll thumbnail into view (horizontal only for desktop)
function scrollToThumbnail(track: HTMLDivElement | null, index: number): void {
  if (!track) return;

  const thumbnail = track.querySelector(
    `[data-thumbnail-index="${index}"]`
  ) as HTMLElement | null;

  if (!thumbnail) return;

  const scrollPosition =
    thumbnail.offsetLeft - track.clientWidth / 2 + thumbnail.clientWidth / 2;
  track.scrollTo({ left: Math.max(0, scrollPosition), behavior: "smooth" });
}

// Carousel track component - pure rendering, no scroll effects
interface CarouselTrackProps {
  trackRef: RefObject<HTMLDivElement | null>;
  onThumbnailClick: (index: number) => void;
}

function CarouselTrack({
  trackRef,
  onThumbnailClick,
}: CarouselTrackProps): ReactNode {
  const { photos, currentIndex } = useGallery();

  return (
    <div
      ref={trackRef}
      className="flex h-full gap-2 p-2 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
    >
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className="h-full aspect-square shrink-0 snap-center"
          data-thumbnail-index={index}
        >
          <Thumbnail
            photo={photo}
            index={index}
            isActive={index === currentIndex}
            onClick={onThumbnailClick}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Desktop-only horizontal carousel showing all photo thumbnails.
 * Automatically scrolls to keep the active thumbnail centered.
 */
export function PhotoCarousel({
  mainContainerRef,
  desktopRef,
}: PhotoCarouselProps): ReactNode {
  const { currentIndex, setCurrentIndex } = useGallery();

  // Sync carousel position when currentIndex changes
  useEffect(() => {
    scrollToThumbnail(desktopRef.current, currentIndex);
  }, [currentIndex, desktopRef]);

  // Handle thumbnail click - update index and scroll main gallery
  const handleThumbnailClick = useCallback(
    (index: number): void => {
      setCurrentIndex(index);
      scrollToPhoto(mainContainerRef, index);
    },
    [setCurrentIndex, mainContainerRef]
  );

  return (
    <nav
      className="flex-[0.15] bg-neutral-900/50 overflow-hidden"
      role="navigation"
      aria-label="Miniaturas de fotos"
    >
      <div className="h-full">
        <CarouselTrack
          trackRef={desktopRef}
          onThumbnailClick={handleThumbnailClick}
        />
      </div>
    </nav>
  );
}
