// Shared by the canvas tile, the canvas focus stage and the session gallery
// slide, so the browser morphs the same photo between them.
export const PHOTO_FOCUS_TRANSITION_NAME = "photo-focus";

export const STAGE_TRANSITION_CLASSES = {
  "stage-open": "stage-root",
  "stage-close": "stage-root",
  "stage-swap": "stage-root",
  "stage-resize": "stage-root",
  default: "none",
} as const;

export const PHOTO_TRANSITION_CLASSES = {
  "stage-open": "photo-focus photo-open",
  "stage-close": "photo-focus photo-close",
  "stage-swap": "photo-focus photo-swap",
  "stage-resize": "photo-focus photo-resize",
  default: "none",
} as const;

export const SHEET_TRANSITION_CLASSES = {
  "stage-open": "stage-sheet",
  "stage-close": "stage-sheet",
  "stage-swap": "stage-sheet sheet-swap",
  "stage-resize": "stage-sheet",
  default: "none",
} as const;
