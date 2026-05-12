import { parseRichText } from "@utils/render-rich-text";

export const ABOUT_PANEL_ID = "about-panel";
export const ABOUT_PANEL_TITLE_ID = "about-panel-title";
export const ABOUT_TRIGGER_ID = "about-trigger";

export const DEFAULT_DESCRIPTION =
  "Sesiones visuales etiquetadas por especialidad. Todo el contexto vive aquí; el panel derecho se reserva para la imagen.";

export const DEFAULT_DESCRIPTION_DOCUMENT = parseRichText(DEFAULT_DESCRIPTION);
