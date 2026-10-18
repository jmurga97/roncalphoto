import { useCallback, useEffect, useMemo, useRef } from "react";

import { prefersReducedMotion } from "@utils/prefers-reduced-motion";

import { OVERVIEW_ANIMATION_MS } from "../constants";

import type { Camera } from "../types";
import type { RefObject } from "react";

export interface CanvasCameraControls {
  animateTo: (target: Camera, durationMs?: number) => void;
  cameraRef: RefObject<Camera>;
  jumpTo: (camera: Camera) => void;
  setCamera: (camera: Camera) => void;
  stopAnimation: () => void;
}

// easeOutCubic, the same curve the rAF tween computes by hand.
const EASE_OUT_CUBIC = "cubic-bezier(0.33, 1, 0.68, 1)";

function toTransform({ x, y, scale }: Camera) {
  return `translate(${x}px, ${y}px) scale(${scale})`;
}

function writeTransform(world: HTMLDivElement | null, camera: Camera) {
  if (world) {
    world.style.transform = toTransform(camera);
  }
}

/**
 * Owns the canvas camera. Pan/zoom frames never touch React state: the
 * transform is written directly to the world element, batched through a
 * single requestAnimationFrame per frame. Every camera goes through
 * `constrain`, so all gestures and tweens share the same limits.
 */
export function useCanvasCamera(
  worldRef: RefObject<HTMLDivElement | null>,
  constrain: (camera: Camera) => Camera,
): CanvasCameraControls {
  const cameraRef = useRef<Camera>({ x: 0, y: 0, scale: 1 });
  const applyFrameRef = useRef<number | null>(null);
  const tweenFrameRef = useRef<number | null>(null);
  const panAnimationRef = useRef<Animation | null>(null);

  const setCamera = useCallback(
    (camera: Camera) => {
      cameraRef.current = constrain(camera);

      if (applyFrameRef.current !== null) {
        return;
      }

      applyFrameRef.current = requestAnimationFrame(() => {
        applyFrameRef.current = null;
        writeTransform(worldRef.current, cameraRef.current);
      });
    },
    [constrain, worldRef],
  );

  const stopAnimation = useCallback(() => {
    if (tweenFrameRef.current !== null) {
      cancelAnimationFrame(tweenFrameRef.current);
      tweenFrameRef.current = null;
    }

    const panAnimation = panAnimationRef.current;

    if (panAnimation) {
      panAnimationRef.current = null;
      // Freeze the camera where the compositor has it, so the next gesture starts from what is on screen.
      const world = worldRef.current;

      if (world) {
        const { a, e, f } = new DOMMatrixReadOnly(getComputedStyle(world).transform);
        cameraRef.current = { x: e, y: f, scale: a };
        writeTransform(world, cameraRef.current);
      }

      panAnimation.cancel();
    }
  }, [worldRef]);

  // Writes the camera now, not on the next frame: for jumps that must land before a view-transition snapshot.
  const jumpTo = useCallback(
    (camera: Camera) => {
      stopAnimation();

      if (applyFrameRef.current !== null) {
        cancelAnimationFrame(applyFrameRef.current);
        applyFrameRef.current = null;
      }

      cameraRef.current = constrain(camera);
      writeTransform(worldRef.current, cameraRef.current);
    },
    [constrain, stopAnimation, worldRef],
  );

  const animateTo = useCallback(
    (target: Camera, durationMs: number = OVERVIEW_ANIMATION_MS) => {
      stopAnimation();

      if (durationMs <= 0 || prefersReducedMotion()) {
        setCamera(target);
        return;
      }

      const from = { ...cameraRef.current };
      const to = constrain(target);
      const world = worldRef.current;

      // Pan-only tweens (the load drift, reveals) run as WAAPI so they stay smooth while the page is busy.
      // The inline style already holds the end state, so nothing is written when the animation finishes.
      if (world && from.scale === to.scale) {
        cameraRef.current = to;
        writeTransform(world, to);
        panAnimationRef.current = world.animate([{ transform: toTransform(from) }, { transform: toTransform(to) }], {
          duration: durationMs,
          easing: EASE_OUT_CUBIC,
        });
        return;
      }

      const start = performance.now();

      // Already inside a frame callback: write directly instead of queueing another frame through setCamera.
      const step = (now: number) => {
        const progress = Math.min((now - start) / durationMs, 1);
        const eased = 1 - (1 - progress) ** 3;

        cameraRef.current = constrain({
          x: from.x + (to.x - from.x) * eased,
          y: from.y + (to.y - from.y) * eased,
          // Log-interpolated scale keeps the perceived zoom speed constant.
          scale: from.scale * (to.scale / from.scale) ** eased,
        });
        writeTransform(worldRef.current, cameraRef.current);

        tweenFrameRef.current = progress < 1 ? requestAnimationFrame(step) : null;
      };

      tweenFrameRef.current = requestAnimationFrame(step);
    },
    [constrain, setCamera, stopAnimation, worldRef],
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

  return useMemo(
    () => ({ animateTo, cameraRef, jumpTo, setCamera, stopAnimation }),
    [animateTo, jumpTo, setCamera, stopAnimation],
  );
}
