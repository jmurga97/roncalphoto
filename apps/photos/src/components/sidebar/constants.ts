import { parseRichText } from "@utils/render-rich-text";

export const DEFAULT_DESCRIPTION =
  "Sesiones visuales etiquetadas por especialidad. Todo el contexto vive aquí; el panel derecho se reserva para la imagen.";

export const DEFAULT_DESCRIPTION_DOCUMENT = parseRichText(DEFAULT_DESCRIPTION);
