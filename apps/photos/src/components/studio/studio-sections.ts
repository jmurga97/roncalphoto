// Each id is also the section's URL hash (`/#servicios`).
export const STUDIO_SECTIONS = [
  { id: "sobre-mi", label: "Sobre mí" },
  { id: "servicios", label: "Servicios" },
  { id: "contacto", label: "Contacto" },
] as const;

export type StudioSection = (typeof STUDIO_SECTIONS)[number]["id"];

export function studioSectionFromHash(hash: string): StudioSection | undefined {
  return STUDIO_SECTIONS.find(({ id }) => hash === `#${id}`)?.id;
}
