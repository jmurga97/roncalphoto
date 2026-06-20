import { useInViewport } from "@utils/use-in-viewport";

import type { DeliveryDetailPhoto, DeliveryPhotoStatus } from "@lib/deliveries/types";

const statusPresentation: Record<
  DeliveryPhotoStatus,
  { label: string; tone: "default" | "accent" | "success" | "warning" | "error" }
> = {
  ready: { label: "Lista", tone: "success" },
  processing: { label: "Procesando", tone: "accent" },
  failed: { label: "Error", tone: "error" },
};

export function DeliveryDetailPhotoItem({ photo }: { photo: DeliveryDetailPhoto }) {
  const { isInViewport, ref } = useInViewport<HTMLLIElement>();
  const presentation = statusPresentation[photo.status];

  return (
    <li
      ref={ref}
      className="border-mc-border bg-mc-surface grid min-h-[4.5rem] grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-4 rounded-md border p-3"
    >
      <div className="bg-mc-surface-raised aspect-4/3 w-16 overflow-hidden rounded-sm">
        {isInViewport ? (
          <img
            className="block size-full object-cover"
            alt=""
            loading="lazy"
            src={photo.thumbnailUrl}
          />
        ) : (
          <span
            className="text-mc-text-disabled grid size-full place-items-center font-mono text-[0.625rem]"
            aria-hidden="true"
          >
            [···]
          </span>
        )}
      </div>
      <span className="text-mc-text-display min-w-0 truncate">{photo.title}</span>
      <mc-badge tone={presentation.tone}>{presentation.label}</mc-badge>
    </li>
  );
}
