import { useEffect, useLayoutEffect, useRef } from "react";

import { prefersReducedMotion } from "@utils/prefers-reduced-motion";

import { GalleryEmptyState } from "./components/gallery-empty-state";
import { GalleryGrid } from "./components/gallery-grid";
import { useGalleryKeyboardNav } from "./hooks/use-gallery-keyboard-nav";
import { useScreenMode } from "./hooks/use-screen-mode";
import { useVisibleSlideObserver } from "./hooks/use-visible-slide-observer";
import { scrollPhotoIntoView } from "./utils/scroll-photo-into-view";

import type { GalleryData } from "./types";

interface GalleryViewProps {
  galleryData: GalleryData;
  // Changes when the stage resizes the photo, so its ViewTransition sees an update (see GallerySlide).
  photoLayout?: string;
  showThumbnails?: boolean;
  showTitle?: boolean;
  thumbnailsTarget?: HTMLElement | null;
  transitionPhotoId?: string;
}

export function GalleryView({
  galleryData,
  photoLayout,
  showThumbnails,
  showTitle = true,
  thumbnailsTarget,
  transitionPhotoId,
}: GalleryViewProps) {
  const screenMode = useScreenMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitialScrollAlignedRef = useRef(false);
  // oxlint-disable-next-line unicorn/no-useless-undefined -- React 19 requires an initial ref value.
  const pendingProgrammaticPhotoIdRef = useRef<string | undefined>(undefined);
  // oxlint-disable-next-line unicorn/no-useless-undefined -- React 19 requires an initial ref value.
  const pendingScrollBehaviorRef = useRef<ScrollBehavior | undefined>(undefined);
  const sessionSlugRef = useRef(galleryData.sessionSlug);

  // Re-align the selected slide when Activity reveals the retained gallery.
  useLayoutEffect(
    () => () => {
      hasInitialScrollAlignedRef.current = false;
    },
    [],
  );

  // Reset scroll-tracking state when navigating to a different session
  useEffect(() => {
    if (sessionSlugRef.current !== galleryData.sessionSlug) {
      sessionSlugRef.current = galleryData.sessionSlug;
      hasInitialScrollAlignedRef.current = false;
      pendingProgrammaticPhotoIdRef.current = undefined;
      pendingScrollBehaviorRef.current = undefined;
    }
  }, [galleryData.sessionSlug]);

  function selectPhoto(photoId: string, options: { behavior?: ScrollBehavior; scroll: boolean }) {
    if (options.scroll) {
      pendingProgrammaticPhotoIdRef.current = photoId;
      const behavior = options.behavior ?? (prefersReducedMotion() ? "auto" : "smooth");

      if (photoId === galleryData.selection.normalizedPhotoId) {
        scrollPhotoIntoView(containerRef.current, photoId, behavior);
      } else {
        pendingScrollBehaviorRef.current = behavior;
      }
    }

    galleryData.setPhotoId(photoId);
  }

  // Layout effect: the opened slide must be in place before the view transition snapshots it.
  useLayoutEffect(() => {
    if (
      hasInitialScrollAlignedRef.current ||
      galleryData.photos.length === 0 ||
      !galleryData.selection.isSelectionValid ||
      !galleryData.selection.normalizedPhotoId
    ) {
      return;
    }

    pendingProgrammaticPhotoIdRef.current = galleryData.selection.normalizedPhotoId;
    scrollPhotoIntoView(containerRef.current, galleryData.selection.normalizedPhotoId, "auto");
    hasInitialScrollAlignedRef.current = true;
  }, [
    galleryData.sessionSlug,
    galleryData.photos.length,
    galleryData.selection.isSelectionValid,
    galleryData.selection.normalizedPhotoId,
  ]);

  // The mobile info panel can resize the slides: measure the target after its content updates.
  useLayoutEffect(() => {
    const photoId = galleryData.selection.normalizedPhotoId;
    const behavior = pendingScrollBehaviorRef.current;

    if (!behavior || !photoId || photoId !== pendingProgrammaticPhotoIdRef.current) return;

    pendingScrollBehaviorRef.current = undefined;
    scrollPhotoIntoView(containerRef.current, photoId, behavior);
  }, [galleryData.selection.normalizedPhotoId]);

  useGalleryKeyboardNav({
    currentIndex: galleryData.selection.currentIndex,
    onSelectPhoto: (photoId) => selectPhoto(photoId, { scroll: true }),
    photos: galleryData.photos,
  });

  useVisibleSlideObserver({
    containerRef,
    onProgrammaticTargetReached: () => {
      pendingProgrammaticPhotoIdRef.current = undefined;
    },
    onVisibleChange: (photoId) => selectPhoto(photoId, { scroll: false }),
    pendingProgrammaticPhotoIdRef,
    photos: galleryData.photos,
    selectedPhotoId: galleryData.selection.normalizedPhotoId,
  });

  if (galleryData.photos.length === 0) {
    return <GalleryEmptyState />;
  }

  return (
    <GalleryGrid
      containerRef={containerRef}
      currentIndex={galleryData.selection.currentIndex}
      onSelectPhoto={(photoId) => selectPhoto(photoId, { scroll: true })}
      galleryKey={galleryData.sessionSlug}
      photoLayout={photoLayout}
      photos={galleryData.photos}
      sessionTitle={galleryData.sessionTitle}
      showThumbnails={showThumbnails ?? screenMode === "desktop"}
      showTitle={showTitle}
      thumbnailsTarget={thumbnailsTarget}
      transitionPhotoId={transitionPhotoId}
    />
  );
}
