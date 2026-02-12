import type { ReactNode, RefObject } from "react";
import { useGallery } from "./context/GalleryContext";
import { useKeyboardNavigation } from "./hooks";
import { PhotoViewer } from "./PhotoViewer";

interface MainGalleryProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

export function MainGallery({ containerRef }: MainGalleryProps): ReactNode {
  const { photos } = useGallery();

  // Enable keyboard navigation
  useKeyboardNavigation();

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scrollbar-hide"
    >
      {photos.map((photo, index) => (
        <PhotoViewer key={photo.id} photo={photo} index={index} />
      ))}
    </div>
  );
}
