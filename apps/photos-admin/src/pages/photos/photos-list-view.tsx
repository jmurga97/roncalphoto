import { McButton, McResourceTable, McSearchField, McStatusText } from "@murga/components/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";

import { EmptyState } from "@components/empty-state";
import { photosListQueryOptions } from "@lib/api/photos/query-options";
import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";

export function PhotosListView() {
  const navigate = useNavigate();
  const { data: photos } = useSuspenseQuery(photosListQueryOptions());
  const { data: sessions } = useSuspenseQuery(sessionsListQueryOptions());
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);
  const sessionTitleById = new Map(sessions.map((session) => [session.id, session.title]));
  const filteredPhotos = photos.filter((photo) => {
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
        <h2>Listado completo y navegación rápida a edición.</h2>
        <p>
          Busca entre todas las fotos, revisa su relación con la sesión y navega al editor de URLs,
          copy y metadata técnica.
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
            <McStatusText
              label={`${filteredPhotos.length} resultados visibles / ${photos.length} totales`}
              polite
              tone="idle"
            />
          </div>
          <McButton
            className="admin-inline-button"
            onClick={() => {
              void navigate({ to: "/photos/new" });
            }}
            variant="primary"
          >
            Nueva foto
          </McButton>
        </div>

        {filteredPhotos.length > 0 ? (
          <McResourceTable
            columns={[
              { id: "alt", label: "Alt" },
              { id: "session", label: "Sesión" },
              { id: "sortOrder", label: "Orden", align: "end", width: "88px" },
              { id: "iso", label: "ISO", align: "end", width: "88px" },
            ]}
            onMcRowSelect={(event) => {
              void navigate({
                to: "/photos/$id",
                params: { id: event.detail.selectedId },
              });
            }}
            rows={filteredPhotos.map((photo) => ({
              id: photo.id,
              cells: {
                alt: photo.alt,
                session: sessionTitleById.get(photo.sessionId) ?? photo.sessionId,
                sortOrder: photo.sortOrder,
                iso: photo.metadata.iso,
              },
            }))}
          />
        ) : (
          <EmptyState
            action={
              <McButton
                className="admin-inline-button"
                onClick={() => {
                  void navigate({ to: "/photos/new" });
                }}
                variant="primary"
              >
                Crear foto
              </McButton>
            }
            description="Prueba con otra búsqueda o crea una nueva foto manualmente por URLs."
            title="No hay fotos visibles"
          />
        )}
      </section>
    </div>
  );
}
