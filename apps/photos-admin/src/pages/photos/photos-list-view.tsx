import { McSearchField } from "@murga.ing/components/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";

import { EmptyState } from "@components/empty-state";
import { PhotoPreviewDialog } from "@components/photos/photo-preview-dialog";
import { PhotosResourceList } from "@components/photos/photos-resource-list";
import { photosListQueryOptions } from "@lib/api/photos/query-options";
import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";

import type { PhotoWithQueueStatus } from "@components/photos/photos-resource-list";
import type { ApiPhoto } from "@roncal/shared";

export function PhotosListView() {
  const navigate = useNavigate();
  const { data: photos } = useSuspenseQuery(photosListQueryOptions());
  const { data: sessions } = useSuspenseQuery(sessionsListQueryOptions());
  const [searchValue, setSearchValue] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<ApiPhoto | null>(null);
  const deferredSearch = useDeferredValue(searchValue);
  const sessionTitleById = new Map(sessions.map((session) => [session.id, session.title]));
  const photosWithStatus: PhotoWithQueueStatus[] = photos;
  const filteredPhotos = photosWithStatus.filter((photo) => {
    const haystack = [
      photo.alt,
      photo.about,
      photo.url,
      sessionTitleById.get(photo.sessionId) ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(deferredSearch.toLowerCase());
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div className="admin-kicker">Photos</div>
        <h2>Estado y revisión de todas tus fotos.</h2>
        <p>
          Revisa previews, estado de procesamiento y sesión. Abre cada título para completar su
          edición.
        </p>
      </header>

      <section className="admin-table-shell">
        <div className="admin-toolbar">
          <div className="admin-toolbar-controls">
            <McSearchField
              onMcChange={(event) => {
                setSearchValue(event.detail.value);
              }}
              onMcClear={() => {
                setSearchValue("");
              }}
              placeholder="Buscar por alt, sesión o URL"
              value={searchValue}
            />
            <mc-status-text
              label={`${filteredPhotos.length} resultados visibles / ${photos.length} totales`}
              polite
              tone="idle"
            />
          </div>
          <mc-button
            className="admin-inline-button"
            onClick={() => {
              void navigate({ to: "/photos/new" });
            }}
            variant="primary"
          >
            Subir fotos
          </mc-button>
        </div>

        {filteredPhotos.length > 0 ? (
          <PhotosResourceList
            onEdit={(id) => {
              void navigate({
                to: "/photos/$id",
                params: { id },
              });
            }}
            onPreview={setPreviewPhoto}
            photos={filteredPhotos}
            sessionTitleById={sessionTitleById}
          />
        ) : (
          <EmptyState
            action={
              <mc-button
                className="admin-inline-button"
                onClick={() => {
                  void navigate({ to: "/photos/new" });
                }}
                variant="primary"
              >
                Subir fotos
              </mc-button>
            }
            description="Prueba con otra búsqueda o prepara un nuevo lote de imágenes."
            title="No hay fotos visibles"
          />
        )}
      </section>

      <PhotoPreviewDialog
        onClose={() => {
          setPreviewPhoto(null);
        }}
        photo={previewPhoto}
      />
    </div>
  );
}
