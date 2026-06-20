import { useEffect, useRef, useState } from "react";

const DEFAULT_ROOT_MARGIN = "200px";

/**
 * Tracks whether the referenced element has entered the viewport.
 *
 * Once the element intersects it stays `true` and the observer disconnects, so
 * each item only renders its heavy content one time when it becomes visible.
 */
export function useInViewport<T extends Element>(rootMargin: string = DEFAULT_ROOT_MARGIN) {
  const ref = useRef<T>(null);
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node || isInViewport || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsInViewport(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [isInViewport, rootMargin]);

  return { isInViewport, ref };
}
