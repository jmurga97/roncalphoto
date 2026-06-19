import { GalleryView } from "./gallery-view";
import { useGalleryViewModel } from "./hooks/use-gallery-view-model";

export function SessionGalleryView() {
  const galleryData = useGalleryViewModel();

  return <GalleryView galleryData={galleryData} />;
}
