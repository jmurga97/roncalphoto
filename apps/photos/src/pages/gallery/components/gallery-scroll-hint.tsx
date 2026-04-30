import { useGalleryScrollHint } from "../hooks/use-gallery-scroll-hint";

interface GalleryScrollHintProps {
  photoCount: number;
}

export function GalleryScrollHint({ photoCount }: GalleryScrollHintProps) {
  const { shouldShowScrollHint } = useGalleryScrollHint({ photoCount });

  if (!shouldShowScrollHint) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 bottom-3 z-10 flex w-max -translate-x-1/2 animate-pulse flex-row gap-2 items-center rounded-full border border-[color:color-mix(in_srgb,var(--color-border)_60%,transparent)] bg-[color:color-mix(in_srgb,var(--color-bg)_72%,transparent)] px-3.5 py-[0.55rem] text-[var(--color-text)] motion-reduce:animate-none"
    >
      <span className="text-sm font-semibold leading-none tracking-[0.28em] uppercase">
        scroll
      </span>
      <span className="text-sm leading-none">↓</span>
    </div>
  );
}
