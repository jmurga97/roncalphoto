import type { ImageProfile } from "./types";

export const portfolioMainProfile = {
  width: 1920,
  fit: "scale-down",
  quality: 85,
} as const satisfies ImageProfile;

export const portfolioThumbnailProfile = {
  width: 480,
  fit: "scale-down",
  quality: 80,
} as const satisfies ImageProfile;
