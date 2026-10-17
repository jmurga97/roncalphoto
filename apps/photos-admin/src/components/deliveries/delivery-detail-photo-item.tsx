import { Badge } from "@jmurga97/components";

import { useInViewport } from "@utils/use-in-viewport";

import type { DeliveryDetailPhoto, DeliveryPhotoStatus } from "@lib/deliveries/types";

const statusPresentation: Record<
  DeliveryPhotoStatus,
  { label: string; tone: "neutral" | "info" | "success" | "warning" | "error" }
> = {
  ready: { label: "Lista", tone: "success" },
  processing: { label: "Procesando", tone: "info" },
  failed: { label: "Error", tone: "error" },
};

export function DeliveryDetailPhotoItem({ photo }: { photo: DeliveryDetailPhoto }) {
  const { isInViewport, ref } = useInViewport<HTMLLIElement>();
  const presentation = statusPresentation[photo.status];

  return (
    <li
      ref={ref}
      className="border-border bg-card grid min-h-[4.5rem] grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-ming-4 rounded-ming border p-ming-3"
    >
      <div className="bg-muted aspect-4/3 w-16 overflow-hidden rounded-ming-control">
        {isInViewport ? (
          <img className="block size-full object-cover" alt="" loading="lazy" src={photo.thumbnailUrl} />
        ) : (
          <span
            className="text-muted-foreground grid size-full place-items-center font-mono text-[0.625rem]"
            aria-hidden="true"
          >
            [···]
          </span>
        )}
      </div>
      <span className="text-foreground min-w-0 truncate">{photo.title}</span>
      <Badge tone={presentation.tone}>{presentation.label}</Badge>
    </li>
  );
}
