import { memo, type ReactNode } from "react";
import type { Photo } from "../../../lib/types";

interface ThumbnailProps {
  photo: Photo;
  index: number;
  isActive: boolean;
  onClick: (index: number) => void;
}

function ThumbnailComponent({
  photo,
  index,
  isActive,
  onClick,
}: ThumbnailProps): ReactNode {
  const handleClick = (): void => onClick(index);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        h-full w-full overflow-hidden rounded border-2 transition-all duration-200 
        cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-400 
        focus:ring-offset-2 focus:ring-offset-neutral-900
        ${
          isActive
            ? "border-white scale-105 opacity-100"
            : "border-transparent opacity-60 hover:border-neutral-600 hover:opacity-100"
        }
      `}
      aria-label={`Ver foto ${index + 1}: ${photo.alt}`}
      aria-current={isActive ? "true" : undefined}
    >
      <img
        src={photo.miniature}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </button>
  );
}

export const Thumbnail = memo(ThumbnailComponent, (prev, next) => {
  return (
    prev.photo.id === next.photo.id &&
    prev.index === next.index &&
    prev.isActive === next.isActive
  );
});
