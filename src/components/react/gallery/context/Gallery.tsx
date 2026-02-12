import { useRef, type ReactNode, type RefObject } from "react";
import type { Photo } from "../../../../lib/types";
import { GalleryProvider } from "./GalleryContext";
import { MainGallery } from "../MainGallery";
import { PhotoCarousel } from "../PhotoCarousel";
import { MobileNextPreview } from "../MobileNextPreview";
import { useScreenMode } from "../hooks";

interface GalleryProps {
  photos: Photo[];
  sessionId: string;
}

// Shared refs type for scroll synchronization
export interface GalleryRefs {
  mainContainer: RefObject<HTMLDivElement | null>;
  carouselDesktop: RefObject<HTMLDivElement | null>;
}

// Utility function to scroll main gallery to a specific photo
export function scrollToPhoto(
  containerRef: RefObject<HTMLDivElement | null>,
  index: number
): void {
  const container = containerRef.current;
  if (!container) return;

  const section = container.querySelector(
    `[data-photo-index="${index}"]`
  ) as HTMLElement | null;

  section?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Inner component that uses hooks (must be inside GalleryProvider)
function GalleryContent({
  mainContainerRef,
  carouselDesktopRef,
}: {
  mainContainerRef: RefObject<HTMLDivElement | null>;
  carouselDesktopRef: RefObject<HTMLDivElement | null>;
}): ReactNode {
  const screenMode = useScreenMode();

  return (
    <>
      {/* Main gallery with photos - relative for mobile preview positioning */}
      <div className="flex-1 relative overflow-hidden">
        <MainGallery containerRef={mainContainerRef} />

        {/* Mobile: Show next photo preview overlay */}
        {screenMode === "mobile" && (
          <MobileNextPreview mainContainerRef={mainContainerRef} />
        )}
      </div>

      {/* Desktop: Show full carousel */}
      {screenMode === "desktop" && (
        <PhotoCarousel
          mainContainerRef={mainContainerRef}
          desktopRef={carouselDesktopRef}
        />
      )}
    </>
  );
}

export function Gallery({ photos, sessionId }: GalleryProps): ReactNode {
  // Local refs - passed down to children as props
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const carouselDesktopRef = useRef<HTMLDivElement>(null);

  if (photos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-950 text-neutral-500">
        No hay fotos en esta sesion
      </div>
    );
  }

  return (
    <GalleryProvider photos={photos}>
      <div
        className="flex-1 flex flex-col bg-neutral-950 h-full"
        data-gallery
        data-session-id={sessionId}
      >
        <GalleryContent
          mainContainerRef={mainContainerRef}
          carouselDesktopRef={carouselDesktopRef}
        />
      </div>
    </GalleryProvider>
  );
}
