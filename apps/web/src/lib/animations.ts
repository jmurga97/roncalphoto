// src/lib/animations.ts

import gsap from "gsap";

/**
 * Animación de fade + blur para carga de imágenes
 * opacity: 0 → 1, filter: blur(20px) → blur(0px)
 */
export function fadeInBlur(
  element: HTMLElement | null,
  options: { duration?: number; delay?: number } = {},
): gsap.core.Tween | null {
  if (!element) return null;

  const { duration = 0.8, delay = 0 } = options;

  return gsap.fromTo(
    element,
    {
      opacity: 0,
      filter: "blur(20px)",
    },
    {
      opacity: 1,
      filter: "blur(0px)",
      duration,
      delay,
      ease: "power2.out",
    },
  );
}

/**
 * Animación de aparición de sidebar
 */
export function slideIn(
  element: HTMLElement | null,
  options: { duration?: number; direction?: "left" | "right" } = {},
): gsap.core.Tween | null {
  if (!element) return null;

  const { duration = 0.4, direction = "left" } = options;
  const xStart = direction === "left" ? "-100%" : "100%";

  return gsap.fromTo(
    element,
    { x: xStart, opacity: 0 },
    { x: "0%", opacity: 1, duration, ease: "power3.out" },
  );
}

/**
 * Animación de cierre de sidebar
 */
export function slideOut(
  element: HTMLElement | null,
  options: { duration?: number; direction?: "left" | "right" } = {},
): gsap.core.Tween | null {
  if (!element) return null;

  const { duration = 0.3, direction = "left" } = options;
  const xEnd = direction === "left" ? "-100%" : "100%";

  return gsap.to(element, {
    x: xEnd,
    opacity: 0,
    duration,
    ease: "power3.in",
  });
}

/**
 * Animación stagger para listas de texto
 */
export function staggerFadeIn(
  elements: HTMLElement[] | NodeListOf<Element> | null,
  options: { duration?: number; stagger?: number; delay?: number } = {},
): gsap.core.Tween | null {
  if (!elements || elements.length === 0) return null;

  const { duration = 0.5, stagger = 0.1, delay = 0 } = options;

  return gsap.fromTo(
    elements,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      delay,
      ease: "power2.out",
    },
  );
}

/**
 * Animación de fade simple
 */
export function fadeIn(
  element: HTMLElement | null,
  options: { duration?: number; delay?: number } = {},
): gsap.core.Tween | null {
  if (!element) return null;

  const { duration = 0.4, delay = 0 } = options;

  return gsap.fromTo(element, { opacity: 0 }, { opacity: 1, duration, delay, ease: "power2.out" });
}

/**
 * Animación de fade out
 */
export function fadeOut(
  element: HTMLElement | null,
  options: { duration?: number } = {},
): gsap.core.Tween | null {
  if (!element) return null;

  const { duration = 0.3 } = options;

  return gsap.to(element, {
    opacity: 0,
    duration,
    ease: "power2.in",
  });
}
