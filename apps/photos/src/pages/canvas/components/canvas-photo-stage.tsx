import {
  addTransitionType,
  startTransition,
  useCallback,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  ViewTransition,
} from "react";
import { createPortal } from "react-dom";

import { GalleryView } from "@/pages/gallery";
import { resolveGallerySelection } from "@/pages/gallery/utils/resolve-gallery-selection";
import { useSidebarMobile, useSidebarOpen } from "@app/store";
import { SIDEBAR_SESSION_SLOT_ID } from "@components/sidebar/constants";
import { STAGE_TRANSITION_CLASSES } from "@utils/view-transitions";

import { CanvasNextSessionButton } from "./canvas-next-session-button";
import { CanvasPhotoInfo } from "./canvas-photo-info";

import type { GalleryData } from "@/pages/gallery/types";
import type { Session } from "@roncal/api/router";

interface CanvasPhotoStageProps {
  nextSession?: Session;
  onClose: () => void;
  onOpenSession: (photoId: string) => void;
  onSelectPhoto: (photoId: string) => void;
  selectedPhotoId: string;
  session: Session;
}

function useStageGalleryData(
  session: Session,
  selectedPhotoId: string,
  onSelectPhoto: (photoId: string) => void,
): GalleryData {
  const photos = useMemo(
    () =>
      session.photos.map((photo) => ({
        alt: photo.alt,
        id: photo.id,
        imageSrc: photo.url,
        thumbnailSrc: photo.miniature,
      })),
    [session.photos],
  );

  const selection = useMemo(
    () => resolveGallerySelection(session.photos, selectedPhotoId),
    [selectedPhotoId, session.photos],
  );

  return {
    photos,
    selection,
    setPhotoId: (photoId) => {
      if (photoId) {
        onSelectPhoto(photoId);
      }
    },
    sessionSlug: session.slug,
    sessionTitle: session.title,
  };
}

function isInteractiveTarget(target: EventTarget): boolean {
  return target instanceof Element && Boolean(target.closest("button, a"));
}

function isPhoto(target: EventTarget): boolean {
  return target instanceof Element && target.tagName === "IMG";
}

/**
 * Session stage over the canvas: the session's scroll-snap gallery, opened at
 * the clicked photo, next to a full-height panel with session and photo info.
 * The selected slide shares the clicked tile's view-transition name, so the
 * tile morphs into it and back.
 */
export function CanvasPhotoStage({
  nextSession,
  onClose,
  onOpenSession,
  onSelectPhoto,
  selectedPhotoId,
  session,
}: CanvasPhotoStageProps) {
  const galleryData = useStageGalleryData(session, selectedPhotoId, onSelectPhoto);
  const isMobile = useSidebarMobile();
  const isSidebarOpen = useSidebarOpen();
  // The panel hosts the gallery thumbnails (desktop), rendered there through a portal.
  const [thumbnailsTarget, setThumbnailsTarget] = useState<HTMLElement | null>(null);
  // Desktop: the details take over the main sidebar card (slot in SidebarPanel), rendered there through a portal.
  const [sidebarSlot, setSidebarSlot] = useState<HTMLElement | null>(null);
  // A collapsed sidebar card is hidden and inert, so the details float over the stage instead.
  const detailsTarget = isMobile || !isSidebarOpen ? null : sidebarSlot;
  // Mobile: a tapped photo fills the phone; the next tap brings the details back.
  const [photoDisplay, setPhotoDisplay] = useState({ fullscreen: false });
  const isPhotoFullscreen = photoDisplay.fullscreen;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageTarget, setStageTarget] = useState<HTMLDivElement | null>(null);
  const captureStage = useCallback((stage: HTMLDivElement | null) => {
    stageRef.current = stage;
    if (!stage) return;
    setStageTarget(stage);
    setSidebarSlot(document.querySelector<HTMLElement>(`#${SIDEBAR_SESSION_SLOT_ID}`));
  }, []);
  const alignActivePhoto = useEffectEvent(() => {
    const slide = stageRef.current?.querySelector<HTMLElement>(
      `[data-gallery-photo-id="${CSS.escape(selectedPhotoId)}"]`,
    );
    if (slide?.parentElement) slide.parentElement.scrollTop = slide.offsetTop;
  });
  // The details portal changes the mobile gallery height in the mounting commit.
  useLayoutEffect(() => {
    alignActivePhoto();
  }, [detailsTarget, thumbnailsTarget]);
  const isResizingRef = useRef(false);

  // Snap returns on the next frame: Android paints the old offset if it stays off until completion.
  useLayoutEffect(() => {
    if (!isResizingRef.current) return;
    isResizingRef.current = false;
    const slide = stageRef.current?.querySelector<HTMLElement>(
      `[data-gallery-photo-id="${CSS.escape(selectedPhotoId)}"]`,
    );
    const gallery = slide?.parentElement;
    if (!slide || !gallery) return;
    gallery.scrollTop = slide.offsetTop;
    const frame = requestAnimationFrame(() => {
      gallery.style.scrollSnapType = "";
      gallery.scrollTop = slide.offsetTop;
    });
    return () => {
      cancelAnimationFrame(frame);
      gallery.style.scrollSnapType = "";
    };
  }, [photoDisplay, selectedPhotoId]);

  const toggleFullscreen = () => {
    const gallery = stageRef.current?.querySelector<HTMLElement>("[data-gallery-photo-id]")?.parentElement;
    if (gallery) gallery.style.scrollSnapType = "none";
    isResizingRef.current = true;
    startTransition(() => {
      addTransitionType("stage-resize");
      setPhotoDisplay((previous) => ({ fullscreen: !previous.fullscreen }));
    });
  };
  const index = galleryData.selection.currentIndex;
  const photo = session.photos[index];

  const details = photo ? (
    <CanvasPhotoInfo
      className={detailsTarget ? "canvas-focus-info" : "canvas-focus-info glass"}
      nextSession={nextSession}
      onClose={onClose}
      onOpenSession={onOpenSession}
      photo={photo}
      position={index + 1}
      session={session}
      thumbnailsRef={setThumbnailsTarget}
    />
  ) : null;

  const galleryTarget = stageTarget?.querySelector(".canvas-focus-gallery");

  return (
    <>
      <div
        aria-label={`Sesión ${session.title}`}
        aria-modal={detailsTarget ? undefined : "true"}
        className="canvas-focus"
        data-photo-fullscreen={isMobile && isPhotoFullscreen ? "true" : undefined}
        ref={captureStage}
        role="dialog"
      >
        {/* Desktop: the gaps around the floating sidebar card also return to the canvas. */}
        {detailsTarget ? <div className="absolute inset-0" onClick={onClose} role="presentation" /> : null}
        <div
          className="canvas-focus-gallery"
          onClick={(event) => {
            if (isInteractiveTarget(event.target)) return;

            if (isMobile && (isPhotoFullscreen || isPhoto(event.target))) {
              toggleFullscreen();
            } else if (!isPhoto(event.target)) {
              onClose();
            }
          }}
          // Taps around the photo return to the canvas.
          role="presentation"
        >
          <GalleryView
            galleryData={galleryData}
            key={session.slug}
            photoLayout={isMobile && isPhotoFullscreen ? "fullscreen" : undefined}
            showTitle={false}
            thumbnailsTarget={thumbnailsTarget}
            transitionPhotoId={selectedPhotoId}
          />
        </div>
      </div>
      {/* Sibling portals preserve the DOM layout while letting React capture each exiting surface. */}
      {details && (detailsTarget ?? stageTarget) ? createPortal(details, (detailsTarget ?? stageTarget)!) : null}
      {nextSession && index === session.photos.length - 1 && galleryTarget
        ? createPortal(
            <ViewTransition
              default="none"
              enter={STAGE_TRANSITION_CLASSES}
              exit={STAGE_TRANSITION_CLASSES}
              update={STAGE_TRANSITION_CLASSES}
            >
              <CanvasNextSessionButton
                className="canvas-next-session-mobile glass"
                layout="inline"
                onOpenSession={onOpenSession}
                session={nextSession}
              />
            </ViewTransition>,
            galleryTarget,
          )
        : null}
    </>
  );
}
