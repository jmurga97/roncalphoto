import { useEffect, useState } from "react";

const GALLERY_SCROLL_HINT_STORAGE_KEY = "roncal-gallery-scroll-hint-seen";

let hasShownGalleryScrollHintInMemory = false;

function hasSeenGalleryScrollHint() {
  if (hasShownGalleryScrollHintInMemory || typeof window === "undefined") {
    return hasShownGalleryScrollHintInMemory;
  }

  try {
    return window.localStorage.getItem(GALLERY_SCROLL_HINT_STORAGE_KEY) === "true";
  } catch {
    return hasShownGalleryScrollHintInMemory;
  }
}

function markGalleryScrollHintAsSeen() {
  hasShownGalleryScrollHintInMemory = true;

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(GALLERY_SCROLL_HINT_STORAGE_KEY, "true");
  } catch {
    // Keep the in-memory fallback so the hint still behaves as one-time per runtime.
  }
}

interface UseGalleryScrollHintOptions {
  galleryKey: string;
  photoCount: number;
}

export function useGalleryScrollHint({ galleryKey, photoCount }: UseGalleryScrollHintOptions) {
  const [shownForGalleryKey, setShownForGalleryKey] = useState<string | undefined>(undefined);
  const [shouldShowScrollHint, setShouldShowScrollHint] = useState(false);

  useEffect(() => {
    if (photoCount === 0) {
      setShouldShowScrollHint(false);
      return;
    }

    if (hasSeenGalleryScrollHint()) {
      setShouldShowScrollHint(false);
      return;
    }

    markGalleryScrollHintAsSeen();
    setShownForGalleryKey(galleryKey);
    setShouldShowScrollHint(true);
  }, [photoCount, galleryKey]);

  return {
    shouldShowScrollHint: shouldShowScrollHint && shownForGalleryKey === galleryKey,
  };
}
