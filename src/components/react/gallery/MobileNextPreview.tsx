import { useCallback, type ReactNode, type RefObject } from "react";
import { useGallery } from "./context/GalleryContext";
import { scrollToPhoto } from "./context/Gallery";

interface MobileNextPreviewProps {
  mainContainerRef: RefObject<HTMLDivElement | null>;
}

/**
 * Mobile-only component that shows a preview of the next photo.
 * Displays a thumbnail at the bottom of the screen with a gradient overlay.
 * Implements circular navigation (last photo -> first photo).
 */
export function MobileNextPreview({
  mainContainerRef,
}: MobileNextPreviewProps): ReactNode {
  const { photos, currentIndex, setCurrentIndex } = useGallery();

  // Circular navigation: last photo wraps to first
  const nextIndex = (currentIndex + 1) % photos.length;
  const nextPhoto = photos[nextIndex];

  // Navigate to next photo on click
  const handleClick = useCallback(() => {
    setCurrentIndex(nextIndex);
    scrollToPhoto(mainContainerRef, nextIndex);
  }, [nextIndex, setCurrentIndex, mainContainerRef]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  if (!nextPhoto) return null;

  // Show indicator for circular navigation
  const isLastPhoto = currentIndex === photos.length - 1;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
      {/* Gradient overlay */}
      <div className="h-32 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

      {/* Preview container */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <button
          type="button"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className="group relative w-24 h-24 rounded-lg overflow-hidden border-2 border-white/30
                     hover:border-white/60 transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2
                     focus:ring-offset-black shadow-lg hover:scale-105"
          aria-label={
            isLastPhoto
              ? `Ver primera foto: ${nextPhoto.alt}`
              : `Ver siguiente foto: ${nextPhoto.alt}`
          }
        >
          {/* Thumbnail image */}
          <img
            src={nextPhoto.miniature}
            alt=""
            loading="eager"
            className="h-full w-full object-cover transition-transform duration-200
                       group-hover:scale-110"
          />

          {/* Overlay with arrow indicator */}
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/20
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <svg
              className="w-8 h-8 text-white drop-shadow-lg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>

          {/* Circular indicator for last photo */}
          {isLastPhoto && (
            <div
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90
                            flex items-center justify-center"
              title="Volver al inicio"
            >
              <svg
                className="w-3 h-3 text-neutral-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          )}
        </button>

        {/* Photo counter */}
        <div className="mt-2 text-center text-xs text-white/60">
          {currentIndex + 1} / {photos.length}
        </div>
      </div>
    </div>
  );
}
