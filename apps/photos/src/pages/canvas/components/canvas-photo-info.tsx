import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, ViewTransition } from "react";

import { useSidebarMobile } from "@app/store";
import { TAG_CHIP_CLASS } from "@components/sidebar/constants";
import { parseRichText, RichTextRenderer } from "@utils/render-rich-text";
import { SHEET_TRANSITION_CLASSES } from "@utils/view-transitions";

import { CanvasNextSessionButton } from "./canvas-next-session-button";
import { useSwipe } from "../hooks/use-swipe";

import type { Photo, Session } from "@roncal/api/router";

interface CanvasPhotoInfoProps {
  className: string;
  nextSession?: Session;
  onClose: () => void;
  onOpenSession: (photoId: string) => void;
  photo: Photo;
  position: number;
  session: Session;
  thumbnailsRef: (element: HTMLElement | null) => void;
}

/**
 * Session + photo details. Desktop: a full-height side panel where the session
 * block stays put on top and only the photo block below changes while
 * scrolling. Mobile: a bottom sheet that expands from its handle.
 */
export function CanvasPhotoInfo({
  className,
  nextSession,
  onClose,
  onOpenSession,
  photo,
  position,
  session,
  thumbnailsRef,
}: CanvasPhotoInfoProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  // Only the mobile sheet is its own layer; on desktop the details belong to the sidebar card or the stage.
  const sheetClasses = useSidebarMobile() ? SHEET_TRANSITION_CLASSES : "none";
  const [isExpanded, setIsExpanded] = useState(false);
  const handleSwipe = useSwipe((direction) => {
    if (direction === "up" || direction === "down") {
      setIsExpanded(direction === "up");
    }
  });
  const description = useMemo(() => parseRichText(session.description), [session.description]);

  useEffect(() => {
    closeButtonRef.current?.focus({ preventScroll: true });
  }, [session.id]);

  return (
    <ViewTransition default="none" enter={sheetClasses} exit={sheetClasses} update={sheetClasses}>
      <aside className={className} data-expanded={isExpanded ? "true" : undefined}>
        <button
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Ocultar detalles" : "Mostrar detalles"}
          className="canvas-focus-handle"
          onClick={() => {
            if (!handleSwipe.wasSwipe()) {
              setIsExpanded(!isExpanded);
            }
          }}
          type="button"
          {...handleSwipe.handlers}
        >
          <span aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3">
          <button
            aria-label="Cerrar sesión y volver al canvas"
            title="Volver al canvas"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              fill="none"
              height="20"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="20"
            >
              <path d="M19 12H5m7 7-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <p className="ui-kicker">Sesión</p>
            <h2 className={["editorial-heading mt-1", isExpanded ? "" : "line-clamp-2 md:line-clamp-none"].join(" ")}>
              {session.title}
            </h2>
          </div>
        </div>

        <div className="canvas-focus-details">
          {session.tags.length > 0 ? (
            <ul aria-label={`Tags de ${session.title}`} className="flex flex-wrap gap-1.5">
              {session.tags.map((tag) => (
                <li key={tag.id}>
                  <Link
                    className={`${TAG_CHIP_CLASS} bg-[color:color-mix(in_srgb,var(--color-surface)_60%,transparent)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]`}
                    search={{ photo: undefined, tag: tag.slug }}
                    to="/"
                  >
                    {tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          {description.length > 0 ? (
            <div className="editorial-prose">
              <RichTextRenderer document={description} />
            </div>
          ) : null}
        </div>

        <section aria-live="polite" className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4">
          <p className="ui-kicker tabular-nums">
            Foto {position} / {session.photos.length}
          </p>
          <h3 className="font-[family-name:var(--font-display)] text-lg leading-tight text-[var(--color-text)]">
            {photo.alt}
          </h3>

          <div className="canvas-focus-details">
            {photo.about ? (
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{photo.about}</p>
            ) : null}
          </div>
        </section>

        <div className="mt-auto flex flex-col gap-3">
          {nextSession && position === session.photos.length ? (
            <CanvasNextSessionButton
              className="canvas-next-session-desktop glass"
              layout="stacked"
              onOpenSession={onOpenSession}
              session={nextSession}
            />
          ) : null}
          <div className="canvas-focus-thumbnails" ref={thumbnailsRef} />
        </div>
      </aside>
    </ViewTransition>
  );
}
