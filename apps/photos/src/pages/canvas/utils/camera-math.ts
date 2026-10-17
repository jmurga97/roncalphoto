import { FOCUS_PADDING, MAX_SCALE, MIN_SCALE } from "../constants";

import type { Bounds, Camera, CanvasPlacement, ReservedViewportSpace, Size } from "../types";

// Screen space and world space relate as: screen = world * scale + translation.

export function clampScale(scale: number): number {
  return Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
}

export function panBy(camera: Camera, deltaX: number, deltaY: number): Camera {
  return { ...camera, x: camera.x + deltaX, y: camera.y + deltaY };
}

/**
 * Zooms keeping the world point under the cursor fixed on screen.
 */
export function zoomAt(camera: Camera, cursorX: number, cursorY: number, factor: number): Camera {
  const scale = clampScale(camera.scale * factor);
  const ratio = scale / camera.scale;

  return {
    scale,
    x: cursorX - (cursorX - camera.x) * ratio,
    y: cursorY - (cursorY - camera.y) * ratio,
  };
}

/**
 * "Cover" fit: fills the whole viewport with content (the block may extend
 * slightly beyond the edges), centered on the content.
 */
export function fitBoundsCover(bounds: Bounds, viewport: Size): Camera {
  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;

  if (contentWidth <= 0 || contentHeight <= 0) {
    return { x: viewport.width / 2, y: viewport.height / 2, scale: 1 };
  }

  const scale = clampScale(Math.max(viewport.width / contentWidth, viewport.height / contentHeight));

  return {
    scale,
    x: viewport.width / 2 - (bounds.minX + contentWidth / 2) * scale,
    y: viewport.height / 2 - (bounds.minY + contentHeight / 2) * scale,
  };
}

export function cameraCenteredOn(placement: CanvasPlacement, viewport: Size, scale: number): Camera {
  return {
    scale,
    x: viewport.width / 2 - (placement.x + placement.width / 2) * scale,
    y: viewport.height / 2 - (placement.y + placement.height / 2) * scale,
  };
}

/**
 * Camera that centers a photo in the viewport area not covered by the detail
 * panel (reserved space on the right on desktop, bottom on mobile).
 */
export function cameraForPhoto(placement: CanvasPlacement, viewport: Size, reserved: ReservedViewportSpace): Camera {
  const visibleWidth = Math.max(viewport.width - reserved.right, 1);
  const visibleHeight = Math.max(viewport.height - reserved.bottom, 1);
  const scale = clampScale(
    Math.min(visibleWidth / (placement.width * FOCUS_PADDING), visibleHeight / (placement.height * FOCUS_PADDING)),
  );

  return {
    scale,
    x: visibleWidth / 2 - (placement.x + placement.width / 2) * scale,
    y: visibleHeight / 2 - (placement.y + placement.height / 2) * scale,
  };
}

export function isPlacementVisible(placement: CanvasPlacement, camera: Camera, viewport: Size): boolean {
  const left = placement.x * camera.scale + camera.x;
  const top = placement.y * camera.scale + camera.y;
  const right = left + placement.width * camera.scale;
  const bottom = top + placement.height * camera.scale;

  return right > 0 && bottom > 0 && left < viewport.width && top < viewport.height;
}
