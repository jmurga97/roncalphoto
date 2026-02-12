import { useCallback, useRef, type RefObject } from "react";
import gsap from "gsap";

interface UsePhotoAnimationOptions {
  /** Whether this photo has already been animated */
  isAnimated: boolean;
  /** Callback to mark the photo as animated in global state */
  onAnimated: () => void;
}

interface UsePhotoAnimationReturn {
  /** Ref to attach to the image element */
  imageRef: RefObject<HTMLImageElement | null>;
  /** Ref to attach to the loader element */
  loaderRef: RefObject<HTMLDivElement | null>;
  /** Trigger the fade/blur animation */
  animateIn: () => void;
  /** Handler for image onLoad event */
  handleImageLoad: () => void;
  /** Handler for image onError event */
  handleImageError: () => void;
  /** Check if image is loaded and ready to animate */
  isImageReady: () => boolean;
}

/**
 * Handles the fade/blur animation for photo loading.
 * Uses GSAP for smooth animations without React state.
 * 
 * The animation runs only once per photo, tracked via the isAnimated flag
 * and onAnimated callback which should update global state.
 */
export function usePhotoAnimation({
  isAnimated,
  onAnimated,
}: UsePhotoAnimationOptions): UsePhotoAnimationReturn {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const hasAnimatedRef = useRef(isAnimated);

  // Check if image is loaded and ready
  const isImageReady = useCallback((): boolean => {
    const image = imageRef.current;
    return Boolean(image?.complete && image.naturalHeight > 0);
  }, []);

  // Trigger the animation
  const animateIn = useCallback(() => {
    // Skip if already animated
    if (hasAnimatedRef.current) return;

    const image = imageRef.current;
    const loader = loaderRef.current;

    if (!image || !loader) return;

    // Skip if image not yet loaded
    if (!image.complete || image.naturalHeight === 0) return;

    hasAnimatedRef.current = true;
    onAnimated();

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
          filter: "blur(0px)",
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.1" // Overlap for smoother transition
      );
  }, [onAnimated]);

  // Handle image load - animate if visible
  const handleImageLoad = useCallback(() => {
    const image = imageRef.current;
    if (!image) return;

    // Check if image is in viewport
    const rect = image.getBoundingClientRect();
    const isVisible =
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0;

    if (isVisible) {
      animateIn();
    }
  }, [animateIn]);

  // Handle image error - hide loader
  const handleImageError = useCallback(() => {
    const loader = loaderRef.current;
    if (loader) {
      loader.style.display = "none";
    }
  }, []);

  return {
    imageRef,
    loaderRef,
    animateIn,
    handleImageLoad,
    handleImageError,
    isImageReady,
  };
}
