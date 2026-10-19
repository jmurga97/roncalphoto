import { computeCanvasLayout } from "./compute-canvas-layout";
import { mulberry32 } from "./seeded-random";

import type { CanvasPhotoItem } from "../types";
import type { Session } from "@roncal/api/router";

function toCanvasItems(sessions: Session[]): CanvasPhotoItem[] {
  return sessions.flatMap((session) => {
    const sessionTagSlugs = session.tags.map((tag) => tag.slug);

    return session.photos.map((sessionPhoto) => ({
      alt: sessionPhoto.alt,
      fullSrc: sessionPhoto.url,
      id: sessionPhoto.id,
      miniatureSrc: sessionPhoto.miniature,
      sessionSlug: session.slug,
      sessionTagSlugs,
    }));
  });
}

// Fisher-Yates driven by a seeded PRNG, so a background refetch keeps the order of this visit.
function shuffle<T>(values: T[], seed: number): T[] {
  const random = mulberry32(seed);
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function randomSeed() {
  // oxlint-disable-next-line sonarjs/pseudo-random -- Decorative order, a new one on every visit.
  return Math.floor(Math.random() * 4_294_967_296);
}

/**
 * The wall of one visit: every photo in seeded order, laid out. Shared with the edge worker, which picks
 * the seed and so knows the opening tiles before the page loads.
 */
export function buildCanvasWall(sessions: Session[], seed: number) {
  const items = shuffle(toCanvasItems(sessions), seed);

  return { items, placements: computeCanvasLayout(items.map((item) => item.id)) };
}
