import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { GalleryPhotoViewModel } from "../types";

interface UseVisibleSlideObserverOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  onVisibleChange: (photoId: string) => void;
  photos: GalleryPhotoViewModel[];
  selectedPhotoId?: string;
}

export function useVisibleSlideObserver({
  containerRef,
  onVisibleChange,
  photos,
  selectedPhotoId,
}: UseVisibleSlideObserverOptions) {
  const stateRef = useRef({
    onVisibleChange,
    selectedPhotoId,
  });

  stateRef.current = {
    onVisibleChange,
    selectedPhotoId,
  };

  useEffect(() => {
    const container = containerRef.current;

    if (!container || photos.length === 0) {
      return;
    }

    const slides = Array.from(container.querySelectorAll<HTMLElement>("[data-gallery-photo-id]"));

    if (slides.length === 0) {
      return;
    }

    const visibleRatios = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibleRatios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let bestSlide: HTMLElement | null = null;
        let bestRatio = 0;

        for (const [element, ratio] of visibleRatios) {
          if (ratio < 0.6 || ratio <= bestRatio) {
            continue;
          }

          bestRatio = ratio;
          bestSlide = element as HTMLElement;
        }

        const visiblePhotoId = bestSlide?.dataset.galleryPhotoId;

        if (!visiblePhotoId || visiblePhotoId === stateRef.current.selectedPhotoId) {
          return;
        }

        stateRef.current.onVisibleChange(visiblePhotoId);
      },
      {
        root: container,
        threshold: [0.6],
      },
    );

    for (const slide of slides) {
      visibleRatios.set(slide, 0);
      observer.observe(slide);
    }

    return () => {
      observer.disconnect();
    };
  }, [containerRef, photos]);
}
