import { prefersReducedMotion } from "@utils/prefers-reduced-motion";
import { useEffect, useRef } from "react";
import { GalleryEmptyState } from "./components/gallery-empty-state";
import { GalleryGrid } from "./components/gallery-grid";
import { useGalleryKeyboardNav } from "./hooks/use-gallery-keyboard-nav";
import { useGalleryViewModel } from "./hooks/use-gallery-view-model";
import { useScreenMode } from "./hooks/use-screen-mode";
import { useVisibleSlideObserver } from "./hooks/use-visible-slide-observer";
import { scrollPhotoIntoView } from "./utils/scroll-photo-into-view";

export function GalleryView() {
  const galleryData = useGalleryViewModel();
  const screenMode = useScreenMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitialScrollAlignedRef = useRef(false);
  const sessionSlugRef = useRef(galleryData.sessionSlug);

  if (sessionSlugRef.current !== galleryData.sessionSlug) {
    sessionSlugRef.current = galleryData.sessionSlug;
    hasInitialScrollAlignedRef.current = false;
  }

  function selectPhoto(photoId: string, options: { behavior?: ScrollBehavior; scroll: boolean }) {
    if (options.scroll) {
      scrollPhotoIntoView(
        containerRef.current,
        photoId,
        options.behavior ?? (prefersReducedMotion() ? "auto" : "smooth"),
      );
    }

    galleryData.setPhotoId(photoId);
  }

  useEffect(() => {
    if (
      hasInitialScrollAlignedRef.current ||
      galleryData.photos.length === 0 ||
      !galleryData.selection.isSelectionValid ||
      !galleryData.selection.normalizedPhotoId
    ) {
      return;
    }

    scrollPhotoIntoView(containerRef.current, galleryData.selection.normalizedPhotoId, "auto");
    hasInitialScrollAlignedRef.current = true;
  }, [
    galleryData.photos.length,
    galleryData.selection.isSelectionValid,
    galleryData.selection.normalizedPhotoId,
  ]);

  useGalleryKeyboardNav({
    currentIndex: galleryData.selection.currentIndex,
    onSelectPhoto: (photoId) => selectPhoto(photoId, { scroll: true }),
    photos: galleryData.photos,
  });

  useVisibleSlideObserver({
    containerRef,
    onVisibleChange: (photoId) => selectPhoto(photoId, { scroll: false }),
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
      photos={galleryData.photos}
      showThumbnails={screenMode === "desktop"}
    />
  );
}
