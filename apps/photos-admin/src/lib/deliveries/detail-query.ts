import { queryOptions } from "@tanstack/react-query";

import type { DeliveryDetailPhoto, DeliveryPhotoStatus } from "@lib/deliveries/types";

const DETAIL_LOAD_DELAY_MS = 1000;

const STATUS_BY_INDEX: DeliveryPhotoStatus[] = ["ready", "ready", "processing", "ready", "failed"];

// Offline placeholder: a monochrome SVG encoded as a data URI. No network is hit.
function buildThumbnailDataUrl(index: number) {
  const label = String(index + 1).padStart(2, "0");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">
    <rect width="320" height="240" fill="#111111" />
    <rect x="0.5" y="0.5" width="319" height="239" fill="none" stroke="#333333" />
    <text x="160" y="132" fill="#999999" font-family="'Space Mono', monospace" font-size="48" letter-spacing="4" text-anchor="middle">${label}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildMockDetailPhotos(deliveryId: string, photoCount: number): DeliveryDetailPhoto[] {
  return Array.from({ length: photoCount }, (_, index) => ({
    id: `${deliveryId}-photo-${index + 1}`,
    title: `Toma ${String(index + 1).padStart(2, "0")}`,
    thumbnailUrl: buildThumbnailDataUrl(index),
    status: STATUS_BY_INDEX[index % STATUS_BY_INDEX.length],
  }));
}

// Simulates an async fetch with a 1s delay. Returns mock data only — no real request.
function fetchDeliveryDetail(
  deliveryId: string,
  photoCount: number,
): Promise<DeliveryDetailPhoto[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(buildMockDetailPhotos(deliveryId, photoCount));
    }, DETAIL_LOAD_DELAY_MS);
  });
}

export function deliveryDetailQueryOptions(deliveryId: string, photoCount: number) {
  return queryOptions({
    queryKey: ["deliveries", deliveryId, "detail", photoCount] as const,
    queryFn: () => fetchDeliveryDetail(deliveryId, photoCount),
    staleTime: Infinity,
  });
}
