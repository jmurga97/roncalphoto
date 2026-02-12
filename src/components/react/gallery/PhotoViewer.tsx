import { useEffect, useRef, useCallback, useState, memo, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Photo } from "../../../lib/types";
import { useGallery } from "./context/GalleryContext";

gsap.registerPlugin(ScrollTrigger);

interface PhotoViewerProps {
  photo: Photo;
  index: number;
}

// Fallback timeout in milliseconds - force show image if animation hasn't triggered
const LOADER_FALLBACK_TIMEOUT = 5000;

function PhotoViewerComponent({ photo, index }: PhotoViewerProps): ReactNode {
  const { setCurrentIndex, isPhotoAnimated, markPhotoAnimated } = useGallery();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const hasAnimatedRef = useRef(isPhotoAnimated(photo.id));

  // Use ref to access current index without adding to dependencies
  const indexRef = useRef(index);
  indexRef.current = index;

  // Check if element is in viewport relative to its scroll container
  const isInScrollContainerViewport = useCallback((): boolean => {
    const container = containerRef.current;
    if (!container) return false;

    const scrollContainer = container.closest(".scrollbar-hide") as HTMLElement;
    if (!scrollContainer) {
      // Fallback to window viewport if no scroll container
      const rect = container.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    }

    const containerRect = container.getBoundingClientRect();
    const scrollRect = scrollContainer.getBoundingClientRect();

    return containerRect.top < scrollRect.bottom && containerRect.bottom > scrollRect.top;
  }, []);

  // Force show image - used as fallback when animation fails
  const forceShowImage = useCallback(() => {
    const loader = loaderRef.current;
    const image = imageRef.current;

    if (loader) {
      loader.style.opacity = "0";
      loader.style.display = "none";
    }
    if (image) {
      image.style.opacity = "1";
    }

    hasAnimatedRef.current = true;
    markPhotoAnimated(photo.id);
  }, [markPhotoAnimated, photo.id]);

  // Animation function
  const animateIn = useCallback(() => {
    if (hasAnimatedRef.current) return;

    const loader = loaderRef.current;
    const image = imageRef.current;

    // Check if image is truly loaded
    if (!image?.complete || image.naturalHeight === 0) {
      // Image not ready yet, will retry when isLoaded changes
      return;
    }

    if (!loader) {
      // No loader, just show the image
      if (image) {
        image.style.opacity = "1";
      }
      hasAnimatedRef.current = true;
      markPhotoAnimated(photo.id);
      return;
    }

    hasAnimatedRef.current = true;
    markPhotoAnimated(photo.id);

    // GSAP timeline for coordinated animation
    gsap.timeline()
      .to(loader, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.out",
        onComplete: () => {
          loader.style.display = "none";
        },
      })
      .to(
        image,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.1"
      );
  }, [markPhotoAnimated, photo.id]);

  // Handle image load event
  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Handle image error
  const handleImageError = useCallback(() => {
    // On error, hide loader and show a placeholder or broken image
    forceShowImage();
  }, [forceShowImage]);

  // Stable callback for ScrollTrigger
  const handleEnterViewport = useCallback(() => {
    setCurrentIndex(indexRef.current);

    if (isLoaded) {
      animateIn();
    }
  }, [setCurrentIndex, animateIn, isLoaded]);

  // Check if image is already loaded from cache on mount
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalHeight > 0) {
      // Image already loaded (from cache)
      setIsLoaded(true);
    }
  }, []);

  // Setup ScrollTrigger - runs only once on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollContainer = container.closest(".scrollbar-hide") as HTMLElement;
    if (!scrollContainer) return;

    const trigger = ScrollTrigger.create({
      trigger: container,
      scroller: scrollContainer,
      start: "top center",
      end: "bottom center",
      onEnter: handleEnterViewport,
      onEnterBack: handleEnterViewport,
    });

    return () => {
      trigger.kill();
    };
  }, [handleEnterViewport]);

  // Trigger animation when image loads and we're in viewport
  useEffect(() => {
    if (isLoaded && !hasAnimatedRef.current) {
      // Use correct viewport detection for scroll container
      if (isInScrollContainerViewport()) {
        animateIn();
      }
    }
  }, [isLoaded, animateIn, isInScrollContainerViewport]);

  // Fallback: Force show image after timeout if animation hasn't triggered
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasAnimatedRef.current) {
        console.warn(`PhotoViewer: Fallback triggered for photo ${photo.id}`);
        forceShowImage();
      }
    }, LOADER_FALLBACK_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [photo.id, forceShowImage]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full snap-start snap-always flex items-center justify-center p-4 relative"
      data-photo-index={index}
    >
      {/* Loading indicator */}
      <div
        ref={loaderRef}
        className="absolute inset-0 flex items-center justify-center bg-neutral-950 z-10"
      >
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-neutral-300 rounded-full animate-spin" />
      </div>

      {/* Photo image */}
      <img
        ref={imageRef}
        src={photo.url}
        alt={photo.alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        className="max-h-full max-w-full object-contain opacity-0"
        data-photo-id={photo.id}
      />
    </div>
  );
}

// Memo to prevent unnecessary re-renders
export const PhotoViewer = memo(PhotoViewerComponent, (prev, next) => {
  return prev.photo.id === next.photo.id && prev.index === next.index;
});
