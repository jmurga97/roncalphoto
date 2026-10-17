import { useCallback, useEffect, useMemo, useRef } from "react";

import { prefersReducedMotion } from "@utils/prefers-reduced-motion";

import { FOCUS_ANIMATION_MS } from "../constants";

import type { Camera } from "../types";
import type { RefObject } from "react";

export interface CanvasCameraControls {
  animateTo: (target: Camera, durationMs?: number) => void;
  cameraRef: RefObject<Camera>;
  setCamera: (camera: Camera) => void;
  stopAnimation: () => void;
}

/**
 * Owns the canvas camera. Pan/zoom frames never touch React state: the
 * transform is written directly to the world element, batched through a
 * single requestAnimationFrame per frame.
 */
export function useCanvasCamera(worldRef: RefObject<HTMLDivElement | null>): CanvasCameraControls {
  const cameraRef = useRef<Camera>({ x: 0, y: 0, scale: 1 });
  const applyFrameRef = useRef<number | null>(null);
  const tweenFrameRef = useRef<number | null>(null);

  const setCamera = useCallback(
    (camera: Camera) => {
      cameraRef.current = camera;

      if (applyFrameRef.current !== null) {
        return;
      }

      applyFrameRef.current = requestAnimationFrame(() => {
        applyFrameRef.current = null;
        const world = worldRef.current;

        if (world) {
          const { x, y, scale } = cameraRef.current;
          world.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        }
      });
    },
    [worldRef],
  );

  const stopAnimation = useCallback(() => {
    if (tweenFrameRef.current !== null) {
      cancelAnimationFrame(tweenFrameRef.current);
      tweenFrameRef.current = null;
    }
  }, []);

  const animateTo = useCallback(
    (target: Camera, durationMs: number = FOCUS_ANIMATION_MS) => {
      stopAnimation();

      if (durationMs <= 0 || prefersReducedMotion()) {
        setCamera(target);
        return;
      }

      const from = { ...cameraRef.current };
      const start = performance.now();

      const step = (now: number) => {
        const progress = Math.min((now - start) / durationMs, 1);
        const eased = 1 - (1 - progress) ** 3;

        setCamera({
          x: from.x + (target.x - from.x) * eased,
          y: from.y + (target.y - from.y) * eased,
          // Log-interpolated scale keeps the perceived zoom speed constant.
          scale: from.scale * (target.scale / from.scale) ** eased,
        });

        tweenFrameRef.current = progress < 1 ? requestAnimationFrame(step) : null;
      };

      tweenFrameRef.current = requestAnimationFrame(step);
    },
    [setCamera, stopAnimation],
  );

  useEffect(
    () => () => {
      stopAnimation();

      if (applyFrameRef.current !== null) {
        cancelAnimationFrame(applyFrameRef.current);
        applyFrameRef.current = null;
      }
    },
    [stopAnimation],
  );

  return useMemo(() => ({ animateTo, cameraRef, setCamera, stopAnimation }), [animateTo, setCamera, stopAnimation]);
}
