import { EDGE_SLACK, FIT_ALL_PADDING, MASONRY_COLUMN_WIDTH, MAX_SCALE, MIN_SCALE } from "../constants";

import type { Bounds, Camera, CanvasPlacement, Size } from "../types";

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

function centerOnWorldPoint(worldX: number, worldY: number, viewport: Size, scale: number): Camera {
  return { scale, x: viewport.width / 2 - worldX * scale, y: viewport.height / 2 - worldY * scale };
}

export function cameraCenteredOn(placement: CanvasPlacement, viewport: Size, scale: number): Camera {
  return centerOnWorldPoint(placement.x + placement.width / 2, placement.y + placement.height / 2, viewport, scale);
}

/**
 * Overview camera: centered on the wall at a scale where tiles are `tilePx` wide on screen.
 */
export function overviewCamera(bounds: Bounds, viewport: Size, tilePx: number): Camera {
  return constrainCamera(
    centerOnWorldPoint(
      (bounds.minX + bounds.maxX) / 2,
      (bounds.minY + bounds.maxY) / 2,
      viewport,
      tilePx / MASONRY_COLUMN_WIDTH,
    ),
    bounds,
    viewport,
  );
}

// Clamps the viewport center on one axis so the wall covers the viewport,
// allowing `slack` of overscroll; a wall narrower than the viewport stays centered.
function clampAxis(center: number, min: number, max: number, halfViewport: number, slack: number): number {
  const low = min + halfViewport - slack;
  const high = max - halfViewport + slack;

  return low > high ? (min + max) / 2 : Math.min(Math.max(center, low), high);
}

/**
 * Keeps the wall in view: the scale never drops below "the whole wall fits"
 * and panning stops once the wall's edge is a little inside the viewport.
 * `insetLeft` is the strip covered by the floating sidebar, which counts as
 * outside the viewport.
 */
export function constrainCamera(camera: Camera, bounds: Bounds, viewport: Size, insetLeft = 0): Camera {
  const freeWidth = Math.max(viewport.width - insetLeft, 1);
  const contentWidth = Math.max(bounds.maxX - bounds.minX, 1);
  const contentHeight = Math.max(bounds.maxY - bounds.minY, 1);
  const fitAllScale = Math.min(freeWidth / contentWidth, viewport.height / contentHeight) * FIT_ALL_PADDING;
  const scale = Math.min(Math.max(camera.scale, fitAllScale, MIN_SCALE), MAX_SCALE);
  const halfWidth = freeWidth / 2 / scale;
  const halfHeight = viewport.height / 2 / scale;
  const freeCenterX = insetLeft + freeWidth / 2;
  const centerX = clampAxis(
    (freeCenterX - camera.x) / camera.scale,
    bounds.minX,
    bounds.maxX,
    halfWidth,
    halfWidth * EDGE_SLACK,
  );
  const centerY = clampAxis(
    (viewport.height / 2 - camera.y) / camera.scale,
    bounds.minY,
    bounds.maxY,
    halfHeight,
    halfHeight * EDGE_SLACK,
  );

  return { scale, x: freeCenterX - centerX * scale, y: viewport.height / 2 - centerY * scale };
}

// `insetLeft` is the strip covered by the floating sidebar, as in constrainCamera.
export function isPlacementVisible(placement: CanvasPlacement, camera: Camera, viewport: Size, insetLeft = 0): boolean {
  const left = placement.x * camera.scale + camera.x;
  const top = placement.y * camera.scale + camera.y;
  const right = left + placement.width * camera.scale;
  const bottom = top + placement.height * camera.scale;

  return right > insetLeft && bottom > 0 && left < viewport.width && top < viewport.height;
}
