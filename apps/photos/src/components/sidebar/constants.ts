import { parseRichText } from "@utils/render-rich-text";

// The canvas session stage portals its details here on desktop (see CanvasPhotoStage).
export const SIDEBAR_SESSION_SLOT_ID = "sidebar-session-slot";

export const DEFAULT_DESCRIPTION =
  "Fotografía de bodas, eventos, inmuebles, arquitectura y momentos cotidianos. Explora nuestro portfolio y cuéntanos tu proyecto.";

export const DEFAULT_DESCRIPTION_DOCUMENT = parseRichText(DEFAULT_DESCRIPTION);

export const TAG_CHIP_CLASS =
  "inline-flex items-center rounded-full border border-[color:color-mix(in_srgb,var(--color-accent)_42%,var(--color-border))] px-[0.6rem] py-[0.2rem] text-[0.72rem] font-semibold leading-[1.2] tracking-[0.03em] whitespace-nowrap transition-colors";
