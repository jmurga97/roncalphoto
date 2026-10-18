import { useEffect, useRef } from "react";

import { CLICK_DRAG_TOLERANCE_PX, WHEEL_ZOOM_SENSITIVITY } from "../constants";
import { panBy, zoomAt } from "../utils/camera-math";

import type { CanvasCameraControls } from "./use-canvas-camera";
import type { RefObject } from "react";

interface PointerPoint {
  x: number;
  y: number;
}

interface PointerGestureState {
  pointers: Map<number, PointerPoint>;
  dragDistance: number;
  didPinch: boolean;
  suppressNextClick: boolean;
  hasCapture: boolean;
}

interface UseCanvasPointerControlsOptions {
  camera: CanvasCameraControls;
  onInteract: () => void;
  stageRef: RefObject<HTMLDivElement | null>;
}

function capturePointer(stage: HTMLElement, pointerId: number) {
  try {
    stage.setPointerCapture(pointerId);
  } catch {
    // The pointer was already released; nothing to capture.
  }
}

function handleWheel(stage: HTMLElement, camera: CanvasCameraControls, event: WheelEvent) {
  event.preventDefault();
  camera.stopAnimation();
  const current = camera.cameraRef.current;

  // Trackpad pinch gestures arrive as wheel events with ctrlKey set.
  if (event.ctrlKey || event.metaKey) {
    const rect = stage.getBoundingClientRect();
    const factor = Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY);

    camera.setCamera(zoomAt(current, event.clientX - rect.left, event.clientY - rect.top, factor));
    return;
  }

  camera.setCamera(panBy(current, -event.deltaX, -event.deltaY));
}

function handlePointerDown(
  stage: HTMLElement,
  camera: CanvasCameraControls,
  state: PointerGestureState,
  event: PointerEvent,
) {
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }

  camera.stopAnimation();
  state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (state.pointers.size === 1) {
    state.dragDistance = 0;
    state.didPinch = false;
    state.hasCapture = false;
    return;
  }

  state.didPinch = true;
  state.hasCapture = true;

  for (const pointerId of state.pointers.keys()) {
    capturePointer(stage, pointerId);
  }
}

function handlePinchMove(
  stage: HTMLElement,
  camera: CanvasCameraControls,
  state: PointerGestureState,
  event: PointerEvent,
) {
  const previous = state.pointers.get(event.pointerId);
  const otherEntry = [...state.pointers.entries()].find(([id]) => id !== event.pointerId);

  if (!previous || !otherEntry) {
    return;
  }

  const [, other] = otherEntry;
  const currentPoint = { x: event.clientX, y: event.clientY };
  state.pointers.set(event.pointerId, currentPoint);

  const previousDistance = Math.hypot(previous.x - other.x, previous.y - other.y);
  const currentDistance = Math.hypot(currentPoint.x - other.x, currentPoint.y - other.y);

  if (previousDistance <= 0) {
    return;
  }

  const rect = stage.getBoundingClientRect();
  const midX = (currentPoint.x + other.x) / 2 - rect.left;
  const midY = (currentPoint.y + other.y) / 2 - rect.top;

  camera.setCamera(zoomAt(camera.cameraRef.current, midX, midY, currentDistance / previousDistance));
}

function handlePointerMove(
  stage: HTMLElement,
  camera: CanvasCameraControls,
  state: PointerGestureState,
  event: PointerEvent,
) {
  const previous = state.pointers.get(event.pointerId);

  if (!previous) {
    return;
  }

  if (state.pointers.size >= 2) {
    handlePinchMove(stage, camera, state, event);
    return;
  }

  const deltaX = event.clientX - previous.x;
  const deltaY = event.clientY - previous.y;
  state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  state.dragDistance += Math.hypot(deltaX, deltaY);

  // Capture only once the gesture is clearly a drag: capturing on pointerdown
  // would redirect the resulting click away from the photo tiles.
  if (!state.hasCapture && state.dragDistance >= CLICK_DRAG_TOLERANCE_PX) {
    capturePointer(stage, event.pointerId);
    state.hasCapture = true;
  }

  camera.setCamera(panBy(camera.cameraRef.current, deltaX, deltaY));
}

function handlePointerEnd(state: PointerGestureState, event: PointerEvent) {
  if (!state.pointers.delete(event.pointerId)) {
    return;
  }

  if (state.pointers.size > 0) {
    return;
  }

  if (state.dragDistance >= CLICK_DRAG_TOLERANCE_PX || state.didPinch) {
    state.suppressNextClick = true;
  }
}

function handleClickCapture(state: PointerGestureState, event: MouseEvent) {
  if (state.suppressNextClick) {
    state.suppressNextClick = false;
    event.preventDefault();
    event.stopPropagation();
  }
}

/**
 * Excalidraw-style navigation: drag to pan, wheel/trackpad to pan,
 * ctrl/cmd+wheel or two-finger pinch to zoom toward the cursor.
 */
export function useCanvasPointerControls({ camera, onInteract, stageRef }: UseCanvasPointerControlsOptions) {
  const onInteractRef = useRef(onInteract);
  useEffect(() => {
    onInteractRef.current = onInteract;
  }, [onInteract]);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const state: PointerGestureState = {
      pointers: new Map(),
      dragDistance: 0,
      didPinch: false,
      suppressNextClick: false,
      hasCapture: false,
    };

    const onWheel = (event: WheelEvent) => {
      onInteractRef.current();
      handleWheel(stage, camera, event);
    };
    const onPointerDown = (event: PointerEvent) => {
      onInteractRef.current();
      handlePointerDown(stage, camera, state, event);
    };
    const onPointerMove = (event: PointerEvent) => handlePointerMove(stage, camera, state, event);
    const onPointerEnd = (event: PointerEvent) => handlePointerEnd(state, event);
    const onClick = (event: MouseEvent) => handleClickCapture(state, event);

    // React's onWheel cannot reliably preventDefault (passive listeners).
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerEnd);
    stage.addEventListener("pointercancel", onPointerEnd);
    stage.addEventListener("click", onClick, true);

    return () => {
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerEnd);
      stage.removeEventListener("pointercancel", onPointerEnd);
      stage.removeEventListener("click", onClick, true);
    };
  }, [camera, stageRef]);
}
