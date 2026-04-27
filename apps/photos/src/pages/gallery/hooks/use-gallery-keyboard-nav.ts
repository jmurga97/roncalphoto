import { isEditableTarget } from "@utils/is-editable-target";
import { resolveNextIndexFromKey } from "@utils/resolve-next-index-from-key";
import { useEffect, useRef } from "react";
import type { GalleryPhotoViewModel } from "../types";

interface UseGalleryKeyboardNavOptions {
  currentIndex: number;
  onSelectPhoto: (photoId: string) => void;
  photos: GalleryPhotoViewModel[];
}

export function useGalleryKeyboardNav({
  currentIndex,
  onSelectPhoto,
  photos,
}: UseGalleryKeyboardNavOptions) {
  const stateRef = useRef({
    currentIndex,
    onSelectPhoto,
    photos,
  });

  stateRef.current = {
    currentIndex,
    onSelectPhoto,
    photos,
  };

  useEffect(() => {
    const onDocumentKeydown = (event: KeyboardEvent) => {
      const { currentIndex: activeIndex, onSelectPhoto: selectPhoto, photos } = stateRef.current;

      if (isEditableTarget(event.target) || photos.length === 0) {
        return;
      }

      const nextIndex = resolveNextIndexFromKey({
        currentIndex: activeIndex,
        key: event.key,
        maxIndex: photos.length - 1,
      });

      if (nextIndex === null || nextIndex === activeIndex) {
        return;
      }

      const nextPhoto = photos[nextIndex];

      if (!nextPhoto) {
        return;
      }

      event.preventDefault();
      selectPhoto(nextPhoto.id);
    };

    document.addEventListener("keydown", onDocumentKeydown);

    return () => {
      document.removeEventListener("keydown", onDocumentKeydown);
    };
  }, []);
}
