import type { Photo, Session } from "@roncal/shared";
import { Link } from "@tanstack/react-router";

const CARD_HEIGHT_VARIANTS = [
  "h-[18rem] sm:h-[20rem] lg:h-[21rem]",
  "h-[21rem] sm:h-[23rem] lg:h-[25rem]",
  "h-[24rem] sm:h-[27rem] lg:h-[29rem]",
  "h-[19rem] sm:h-[21rem] lg:h-[23rem]",
] as const;

function hashString(value: string): number {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function getCardHeightClass(slug: string): string {
  const heightClassIndex = hashString(slug) % CARD_HEIGHT_VARIANTS.length;
  return CARD_HEIGHT_VARIANTS[heightClassIndex] ?? CARD_HEIGHT_VARIANTS[0];
}

function pickRandomPhoto(photos: Photo[]): Photo | undefined {
  if (photos.length === 0) {
    return undefined;
  }

  const randomIndex = Math.floor(Math.random() * photos.length);
  return photos[randomIndex];
}

interface HomeSessionCardProps {
  session: Session;
}

export function HomeSessionCard({ session }: HomeSessionCardProps) {
  const previewPhoto = pickRandomPhoto(session.photos);
  const titleClassName = [
    "editorial-heading overflow-hidden text-ellipsis whitespace-nowrap text-lg",
    previewPhoto
      ? "text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
      : "text-[var(--color-text)]",
  ].join(" ");

  return (
    <article className="mb-2 [break-inside:avoid]">
      <Link
        aria-label={`Abrir sesión ${session.title}`}
        className={[
          "group relative block overflow-hidden rounded-[1.35rem] border ui-divider shadow-[var(--shadow-soft)]",
          "transition-transform duration-300 ease-out motion-reduce:transition-none",
          "focus-visible:-translate-y-1 hover:-translate-y-1",
          getCardHeightClass(session.slug),
        ].join(" ")}
        params={{ slug: session.slug }}
        search={() => ({})}
        to="/session/$slug"
      >
        {previewPhoto ? (
          <>
            <img
              alt={previewPhoto.alt || session.title}
              className={[
                "absolute inset-0 h-full w-full object-cover grayscale",
                "transition-transform duration-500 ease-out motion-reduce:transition-none",
                "group-hover:scale-[1.03] group-focus-visible:scale-[1.03]",
              ].join(" ")}
              loading="lazy"
              src={previewPhoto.miniature}
            />
            <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/0 group-focus-visible:bg-black/0 motion-reduce:transition-none" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/82 via-black/38 to-transparent" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, var(--color-surface-2) 0%, var(--color-surface) 100%)",
            }}
          />
        )}

        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-2.5">
          <h2 className={titleClassName}>{session.title}</h2>
        </div>
      </Link>
    </article>
  );
}
