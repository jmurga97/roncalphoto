import type { RouterOutputs } from "@roncal/api/router";

// The edge worker embeds the canvas queries in the HTML, so the first render needs no API round trip.
export const INITIAL_DATA_ELEMENT_ID = "initial-data";

export interface InitialData {
  canvas: RouterOutputs["sessions"]["canvas"];
  list: RouterOutputs["sessions"]["list"];
}

/** Shuffle seed the worker chose for the wall, carried on the data element as `data-canvas-seed`. */
export function initialCanvasSeed(): number | undefined {
  const seed = document.querySelector<HTMLElement>(`#${INITIAL_DATA_ELEMENT_ID}`)?.dataset.canvasSeed;

  return seed ? Number(seed) : undefined;
}
