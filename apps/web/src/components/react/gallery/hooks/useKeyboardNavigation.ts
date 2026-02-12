import { useEffect } from "react";
import { useGallery } from "../context/GalleryContext";

/**
 * Handles keyboard navigation for the gallery.
 * Arrow keys navigate between photos.
 */
export function useKeyboardNavigation(): void {
  const { goToNext, goToPrevious } = useGallery();

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent): void => {
      // Ignore if input is focused
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault();
          goToNext();
          break;
        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault();
          goToPrevious();
          break;
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [goToNext, goToPrevious]);
}
