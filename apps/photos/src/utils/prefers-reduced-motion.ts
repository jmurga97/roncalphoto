export function prefersReducedMotion() {
  return typeof window === "undefined" ? false : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
