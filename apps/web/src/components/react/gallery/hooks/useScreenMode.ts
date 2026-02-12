import { useEffect, useState } from "react";

type ScreenMode = "desktop" | "mobile";

const MOBILE_BREAKPOINT = 768;

/**
 * Detects current screen mode for responsive behavior.
 * Returns 'desktop' or 'mobile' based on viewport width.
 */
export function useScreenMode(): ScreenMode {
  const [mode, setMode] = useState<ScreenMode>(() =>
    typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT ? "mobile" : "desktop",
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const handleChange = (event: MediaQueryListEvent): void => {
      setMode(event.matches ? "mobile" : "desktop");
    };

    // Set initial value
    setMode(mediaQuery.matches ? "mobile" : "desktop");

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return mode;
}
