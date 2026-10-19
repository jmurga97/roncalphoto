export const MIN_SCALE = 0.1;
export const MAX_SCALE = 4;

export const MASONRY_COLUMN_WIDTH = 300;
export const MASONRY_GUTTER = 24;
// Largest vertical start offset between columns, so the wall's top edge is ragged.
export const MASONRY_MAX_STAGGER = 180;
export const ASPECT_BUCKETS = [1, 4 / 5, 3 / 2];
export const TARGET_BLOCK_ASPECT = 1.6;

// On-screen tile width of the overview camera: big enough to recognise photos.
export const OVERVIEW_TILE_PX_MOBILE = 180;
export const OVERVIEW_TILE_PX_DESKTOP = 260;
// The whole wall must fit at the minimum zoom, with a little breathing room.
export const FIT_ALL_PADDING = 0.9;
// Overscroll past the wall's edge, as a fraction of half the viewport.
export const EDGE_SLACK = 0.5;

export const OVERVIEW_ANIMATION_MS = 520;
export const DRIFT_ANIMATION_MS = 1400;
export const DRIFT_OFFSET_PX = 90;
export const REVEAL_ANIMATION_MS = 320;
// Longest wait for the full photo before opening; past it the stage opens without the morph.
export const OPEN_DECODE_TIMEOUT_MS = 200;

export const CLICK_DRAG_TOLERANCE_PX = 5;
// A fingertip wobbles more than a mouse: below this a touch is still a tap.
export const TAP_DRAG_TOLERANCE_PX = 12;
export const KEYBOARD_PAN_STEP_PX = 80;
export const WHEEL_ZOOM_SENSITIVITY = 0.01;
export const SWIPE_THRESHOLD_PX = 50;

export const HINT_STORAGE_KEY = "roncal-canvas-hint-seen";
