import { MOBILE_MEDIA_QUERY } from "@utils/media-queries";
import { useMediaQuery } from "@utils/use-media-query";

export type ScreenMode = "desktop" | "mobile";

export function useScreenMode(): ScreenMode {
  return useMediaQuery(MOBILE_MEDIA_QUERY) ? "mobile" : "desktop";
}
