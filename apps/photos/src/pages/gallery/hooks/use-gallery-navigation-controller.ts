import { getRouteApi } from "@tanstack/react-router";
import { isEditableTarget } from "@utils/is-editable-target";
import { prefersReducedMotion } from "@utils/prefers-reduced-motion";
import { resolveNextIndexFromKey } from "@utils/resolve-next-index-from-key";
import { startTransition, useEffect, useEffectEvent, useRef } from "react";
import type { GalleryPhotoViewModel, GallerySelection } from "../types";

const sessionRouteApi = getRouteApi("/_app/session/$slug");

interface UseGalleryNavigationControllerOptions {
  photos: GalleryPhotoViewModel[];
  selection: GallerySelection;
  sessionSlug: string;
}

function resolveVisibleGalleryIndex(scrollTop: number, clientHeight: number, photoCount: number) {
  if (photoCount === 0 || clientHeight <= 0) {
    return -1;
  }

  return Math.max(0, Math.min(Math.round(scrollTop / clientHeight), photoCount - 1));
}

function isGalleryIndexAligned(container: HTMLDivElement, index: number, photoCount: number) {
  return (
    resolveVisibleGalleryIndex(container.scrollTop, container.clientHeight, photoCount) === index
  );
}

function scrollThumbnailIntoView(thumbnail: HTMLButtonElement | null) {
  if (!thumbnail) {
    return;
  }

  thumbnail.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "nearest",
    inline: "center",
  });
}

export function useGalleryNavigationController({
  photos,
  selection,
  sessionSlug,
}: UseGalleryNavigationControllerOptions) {
  const navigate = sessionRouteApi.useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pendingScrollIndexRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const cancelPendingProgrammaticScroll = useEffectEvent(() => {
    pendingScrollIndexRef.current = null;
  });

  const navigateToPhotoId = useEffectEvent((photoId?: string) => {
    startTransition(() => {
      void navigate({
        params: { slug: sessionSlug },
        replace: true,
        search: (previousSearch) => {
          const normalizedPhotoId = photoId ?? undefined;

          if (previousSearch.photo === normalizedPhotoId) {
            return previousSearch;
          }

          return normalizedPhotoId ? { photo: normalizedPhotoId } : {};
        },
        to: "/session/$slug",
      });
    });
  });

  const syncViewportToIndex = useEffectEvent((index: number) => {
    const photo = photos[index];

    if (!photo) {
      return;
    }

    scrollThumbnailIntoView(thumbnailRefs.current[index]);

    const container = containerRef.current;
    const slide = slideRefs.current[index];

    if (!container || !slide) {
      return;
    }

    if (isGalleryIndexAligned(container, index, photos.length)) {
      if (pendingScrollIndexRef.current === index) {
        pendingScrollIndexRef.current = null;
      }

      return;
    }

    pendingScrollIndexRef.current = index;
    slide.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  });

  const navigateToIndex = useEffectEvent((index: number) => {
    const photo = photos[index];

    if (!photo) {
      return;
    }

    syncViewportToIndex(index);

    if (photos[selection.currentIndex]?.id !== photo.id) {
      navigateToPhotoId(photo.id);
    }
  });

  const handleContainerScroll = useEffectEvent(() => {
    const container = containerRef.current;

    if (!container || photos.length === 0) {
      return;
    }

    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = window.requestAnimationFrame(() => {
      rafIdRef.current = null;

      const visibleIndex = resolveVisibleGalleryIndex(
        container.scrollTop,
        container.clientHeight,
        photos.length,
      );

      if (visibleIndex === -1) {
        return;
      }

      const pendingScrollIndex = pendingScrollIndexRef.current;

      if (pendingScrollIndex !== null) {
        if (visibleIndex !== pendingScrollIndex) {
          return;
        }

        pendingScrollIndexRef.current = null;
      }

      const visiblePhoto = photos[visibleIndex];

      if (visiblePhoto && visiblePhoto.id !== photos[selection.currentIndex]?.id) {
        navigateToPhotoId(visiblePhoto.id);
      }
    });
  });

  const handleUserScrollIntent = useEffectEvent(() => {
    cancelPendingProgrammaticScroll();
  });

  const handleKeydown = useEffectEvent((event: KeyboardEvent) => {
    if (isEditableTarget(event.target) || photos.length === 0) {
      return;
    }

    const nextIndex = resolveNextIndexFromKey({
      key: event.key,
      currentIndex: selection.currentIndex,
      maxIndex: photos.length - 1,
    });

    if (nextIndex === null || nextIndex === selection.currentIndex) {
      return;
    }

    event.preventDefault();
    navigateToIndex(nextIndex);
  });

  useEffect(() => {
    if (selection.isSelectionValid) {
      return;
    }

    navigateToPhotoId(selection.normalizedPhotoId);
  }, [navigateToPhotoId, selection.isSelectionValid, selection.normalizedPhotoId]);

  useEffect(() => {
    syncViewportToIndex(selection.currentIndex);
  }, [selection.currentIndex, syncViewportToIndex]);

  useEffect(() => {
    const onDocumentKeydown = (event: KeyboardEvent) => {
      handleKeydown(event);
    };

    document.addEventListener("keydown", onDocumentKeydown);

    return () => {
      document.removeEventListener("keydown", onDocumentKeydown);
    };
  }, [handleKeydown]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const registerSlide = (index: number) => (element: HTMLElement | null) => {
    slideRefs.current[index] = element;
  };

  const registerThumbnail = (index: number) => (element: HTMLButtonElement | null) => {
    thumbnailRefs.current[index] = element;
  };

  return {
    containerRef,
    currentIndex: selection.currentIndex,
    handleContainerScroll,
    handleUserScrollIntent,
    navigateToIndex,
    navigateToPhotoId,
    registerSlide,
    registerThumbnail,
  };
}
