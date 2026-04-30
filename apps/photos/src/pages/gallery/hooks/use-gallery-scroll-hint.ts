import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const GALLERY_SCROLL_HINT_STORAGE_KEY = "roncal-gallery-scroll-hint-seen";
const sessionRouteApi = getRouteApi("/_app/session/$slug");

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
  photoCount: number;
}

export function useGalleryScrollHint({ photoCount }: UseGalleryScrollHintOptions) {
  const { slug: sessionSlug } = sessionRouteApi.useParams();
  const [shownForSessionSlug, setShownForSessionSlug] = useState<string | undefined>(undefined);
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
    setShownForSessionSlug(sessionSlug);
    setShouldShowScrollHint(true);
  }, [photoCount, sessionSlug]);

  return {
    shouldShowScrollHint: shouldShowScrollHint && shownForSessionSlug === sessionSlug,
  };
}
