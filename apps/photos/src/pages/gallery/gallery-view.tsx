import { GalleryEmptyState } from "./components/gallery-empty-state";
import { GalleryGrid } from "./components/gallery-grid";
import { useGalleryNavigationController } from "./hooks/use-gallery-navigation-controller";
import { useGalleryViewModel } from "./hooks/use-gallery-view-model";
import { useScreenMode } from "./hooks/use-screen-mode";

export function GalleryView() {
  const galleryData = useGalleryViewModel();
  const screenMode = useScreenMode();
  const navigationController = useGalleryNavigationController({
    photos: galleryData.photos,
    selection: galleryData.selection,
    sessionSlug: galleryData.sessionSlug,
  });

  if (galleryData.photos.length === 0) {
    return <GalleryEmptyState />;
  }

  return (
    <GalleryGrid
      containerRef={navigationController.containerRef}
      currentIndex={navigationController.currentIndex}
      onContainerScroll={navigationController.handleContainerScroll}
      onUserScrollIntent={navigationController.handleUserScrollIntent}
      onSelectPhoto={navigationController.navigateToIndex}
      photos={galleryData.photos}
      registerSlide={navigationController.registerSlide}
      registerThumbnail={navigationController.registerThumbnail}
      showThumbnails={screenMode === "desktop"}
    />
  );
}
