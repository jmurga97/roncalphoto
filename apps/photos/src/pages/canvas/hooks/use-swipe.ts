import { useRef } from "react";

import { SWIPE_THRESHOLD_PX } from "../constants";

import type { PointerEvent } from "react";

export type SwipeDirection = "down" | "left" | "right" | "up";

/**
 * Minimal swipe detection on pointer events (touch and mouse drags alike).
 * `wasSwipe` lets a click handler ignore the click that ends a swipe.
 */
export function useSwipe(onSwipe: (direction: SwipeDirection) => void) {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const swipedRef = useRef(false);

  return {
    handlers: {
      onPointerCancel: () => {
        startRef.current = null;
      },
      onPointerDown: (event: PointerEvent) => {
        startRef.current = { x: event.clientX, y: event.clientY };
        swipedRef.current = false;
      },
      onPointerUp: (event: PointerEvent) => {
        const start = startRef.current;
        startRef.current = null;

        if (!start) {
          return;
        }

        const deltaX = event.clientX - start.x;
        const deltaY = event.clientY - start.y;

        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < SWIPE_THRESHOLD_PX) {
          return;
        }

        swipedRef.current = true;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          onSwipe(deltaX < 0 ? "left" : "right");
        } else {
          onSwipe(deltaY < 0 ? "up" : "down");
        }
      },
    },
    wasSwipe: () => swipedRef.current,
  };
}
