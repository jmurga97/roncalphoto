import { Link } from "@tanstack/react-router";
import { Fragment, useEffect, useRef } from "react";

import type { CanvasPhotoItem } from "../types";

interface CanvasDetailPanelProps {
  item?: CanvasPhotoItem;
  onClose: () => void;
}

interface MetadataEntry {
  label: string;
  value: string;
}

function buildMetadataEntries(item: CanvasPhotoItem): MetadataEntry[] {
  const { camera, lens, aperture, shutterSpeed, iso } = item.metadata;

  return [
    { label: "Cámara", value: camera },
    { label: "Objetivo", value: lens },
    { label: "Apertura", value: aperture },
    { label: "Velocidad", value: shutterSpeed },
    { label: "ISO", value: iso > 0 ? String(iso) : "" },
  ].filter((entry) => entry.value.length > 0);
}

export function CanvasDetailPanel({ item, onClose }: CanvasDetailPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastItemRef = useRef<CanvasPhotoItem | undefined>(undefined);

  if (item) {
    lastItemRef.current = item;
  }

  const isOpen = Boolean(item);
  // Keep rendering the last item while the panel slides out.
  const displayed = item ?? lastItemRef.current;

  useEffect(() => {
    if (item?.id) {
      closeButtonRef.current?.focus({ preventScroll: true });
    }
  }, [item?.id]);

  const metadataEntries = displayed ? buildMetadataEntries(displayed) : [];

  return (
    <aside
      aria-labelledby="canvas-detail-title"
      className="canvas-detail-panel"
      data-open={isOpen ? "true" : undefined}
      inert={!isOpen}
      role="dialog"
    >
      {displayed ? (
        <div className="flex h-full flex-col gap-5 overflow-y-auto p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2
              className="font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--color-text)]"
              id="canvas-detail-title"
            >
              {displayed.alt}
            </h2>
            <button
              aria-label="Cerrar detalle"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
              onClick={onClose}
              ref={closeButtonRef}
              type="button"
            >
              ✕
            </button>
          </div>

          {displayed.about ? (
            <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
              {displayed.about}
            </p>
          ) : null}

          {metadataEntries.length > 0 ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-[var(--color-border)] pt-5 text-sm">
              {metadataEntries.map((entry) => (
                <Fragment key={entry.label}>
                  <dt className="text-[var(--color-text-muted)]">{entry.label}</dt>
                  <dd className="text-right text-[var(--color-text)]">{entry.value}</dd>
                </Fragment>
              ))}
            </dl>
          ) : null}

          <div className="mt-auto border-t border-[var(--color-border)] pt-5">
            <Link
              className="text-sm font-semibold text-[var(--color-accent)] underline-offset-4 hover:underline"
              params={{ slug: displayed.sessionSlug }}
              to="/session/$slug"
            >
              Ver sesión: {displayed.sessionTitle}
            </Link>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
