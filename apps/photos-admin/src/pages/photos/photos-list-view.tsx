import { EmptyState } from "@components/empty-state";
import { photosListQueryOptions } from "@lib/api/photos/query-options";
import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import {
  McButton,
  McPagination,
  McResourceTable,
  McSearchField,
  McStatusText,
} from "@murga/components/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";

const photosRouteApi = getRouteApi("/_app/photos");

export function PhotosListView() {
  const navigate = useNavigate();
  const search = photosRouteApi.useSearch();
  const { data: photosPage } = useSuspenseQuery(photosListQueryOptions(search.page, 24));
  const { data: sessions } = useSuspenseQuery(sessionsListQueryOptions());
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);
  const sessionTitleById = new Map(sessions.map((session) => [session.id, session.title]));
  const filteredPhotos = photosPage.data.filter((photo) => {
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
        <h2>Listado paginado y navegación rápida a edición.</h2>
        <p>
          Busca dentro de la página activa, revisa relación con la sesión y navega al editor de
          URLs, copy y metadata técnica.
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
              label={`${filteredPhotos.length} resultados visibles / ${photosPage.pagination.total} totales`}
              polite
              tone="idle"
            />
          </div>
          <McButton
            className="admin-inline-button"
            onClick={() => {
              navigate({ to: "/photos/new", search: { page: search.page } });
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
              navigate({
                to: "/photos/$id",
                params: { id: event.detail.selectedId },
                search: { page: search.page },
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
                  navigate({ to: "/photos/new", search: { page: search.page } });
                }}
                variant="primary"
              >
                Crear foto
              </McButton>
            }
            description="Prueba con otra búsqueda o crea una nueva foto manualmente por URLs."
            title="No hay fotos visibles en esta página"
          />
        )}

        <McPagination
          disabled={photosPage.pagination.total === 0}
          hasMore={photosPage.pagination.hasMore}
          onMcPageChange={(event) => {
            navigate({
              to: "/photos",
              search: {
                page: event.detail.page,
              },
            });
          }}
          page={photosPage.pagination.page}
          pageSize={photosPage.pagination.pageSize}
          total={photosPage.pagination.total}
        />
      </section>
    </div>
  );
}
