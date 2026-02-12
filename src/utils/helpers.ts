// src/utils/helpers.ts

import type { Category, Session } from '../lib/types';

/**
 * Encuentra una categoría por su slug
 */
export function getCategoryBySlug(
  categories: Category[],
  slug: string
): Category | undefined {
  return categories.find((cat) => cat.slug === slug);
}

/**
 * Encuentra una sesión dentro de una categoría
 */
export function getSessionById(
  category: Category,
  sessionId: string
): Session | undefined {
  return category.sessions.find((session) => session.id === sessionId);
}

/**
 * Genera una URL para una sesión
 */
export function getSessionUrl(categorySlug: string, sessionId: string): string {
  return `/${categorySlug}/${sessionId}`;
}

/**
 * Formatea los metadatos de una foto para mostrar
 */
export function formatPhotoMetadata(metadata: {
  iso: number;
  aperture: string;
  shutterSpeed: string;
  lens: string;
  camera: string;
}): string[] {
  return [
    `ISO ${metadata.iso}`,
    metadata.aperture,
    metadata.shutterSpeed,
    metadata.lens,
    metadata.camera,
  ];
}

/**
 * Verifica si estamos en el cliente (no SSR)
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Obtiene el estado del sidebar desde localStorage
 */
export function getSidebarState(): boolean {
  if (!isClient()) return true; // Por defecto abierto en desktop
  const stored = localStorage.getItem('sidebar-open');
  return stored === null ? true : stored === 'true';
}

/**
 * Guarda el estado del sidebar en localStorage
 */
export function setSidebarState(isOpen: boolean): void {
  if (!isClient()) return;
  localStorage.setItem('sidebar-open', String(isOpen));
}

/**
 * Detecta si estamos en un dispositivo móvil basado en el ancho de pantalla
 */
export function isMobile(): boolean {
  if (!isClient()) return false;
  return window.innerWidth < 768;
}
