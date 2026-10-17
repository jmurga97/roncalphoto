import { ASPECT_BUCKETS, MASONRY_COLUMN_WIDTH, MASONRY_GUTTER, TARGET_BLOCK_ASPECT } from "../constants";
import { hashString, mulberry32 } from "./seeded-random";

import type { Bounds, CanvasPlacement } from "../types";

const COLUMN_STRIDE = MASONRY_COLUMN_WIDTH + MASONRY_GUTTER;

function pickAspect(roll: number): number {
  return ASPECT_BUCKETS[Math.min(Math.floor(roll * ASPECT_BUCKETS.length), ASPECT_BUCKETS.length - 1)];
}

/**
 * Chooses how many masonry columns produce a photo block whose aspect ratio
 * is close to TARGET_BLOCK_ASPECT, so the initial camera can fill a typical
 * viewport with it.
 */
function computeColumnCount(photoCount: number): number {
  const averageHeight =
    ASPECT_BUCKETS.reduce((sum, aspect) => sum + MASONRY_COLUMN_WIDTH / aspect, 0) / ASPECT_BUCKETS.length;
  const rowStride = averageHeight + MASONRY_GUTTER;
  const columns = Math.round(Math.sqrt((TARGET_BLOCK_ASPECT * photoCount * rowStride) / COLUMN_STRIDE));

  return Math.max(1, Math.min(columns, photoCount));
}

/**
 * Deterministic masonry: photos are packed tightly into equal-width columns
 * (shortest column first) with varied heights seeded by the photo id, so the
 * layout is stable across reloads without storing positions anywhere. The
 * block is centered on the world origin.
 */
export function computeCanvasLayout(photoIds: string[]): CanvasPlacement[] {
  const columnCount = computeColumnCount(photoIds.length);
  const columnHeights: number[] = Array.from({ length: columnCount }, () => 0);

  const placements = photoIds.map((photoId) => {
    const random = mulberry32(hashString(photoId));
    const height = Math.round(MASONRY_COLUMN_WIDTH / pickAspect(random()));
    const column = columnHeights.indexOf(Math.min(...columnHeights));
    const y = columnHeights[column];
    columnHeights[column] = y + height + MASONRY_GUTTER;

    return {
      photoId,
      x: column * COLUMN_STRIDE,
      y,
      width: MASONRY_COLUMN_WIDTH,
      height,
      rotation: 0,
    };
  });

  const blockWidth = columnCount * COLUMN_STRIDE - MASONRY_GUTTER;
  const blockHeight = Math.max(...columnHeights, MASONRY_GUTTER) - MASONRY_GUTTER;

  return placements.map((placement) => ({
    ...placement,
    x: placement.x - blockWidth / 2,
    y: placement.y - blockHeight / 2,
  }));
}

export function computeContentBounds(placements: CanvasPlacement[]): Bounds {
  if (placements.length === 0) {
    return {
      minX: -MASONRY_COLUMN_WIDTH,
      minY: -MASONRY_COLUMN_WIDTH,
      maxX: MASONRY_COLUMN_WIDTH,
      maxY: MASONRY_COLUMN_WIDTH,
    };
  }

  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const placement of placements) {
    bounds.minX = Math.min(bounds.minX, placement.x);
    bounds.minY = Math.min(bounds.minY, placement.y);
    bounds.maxX = Math.max(bounds.maxX, placement.x + placement.width);
    bounds.maxY = Math.max(bounds.maxY, placement.y + placement.height);
  }
  return bounds;
}
