import { McResourceTable, McSearchField } from "@murga.ing/components/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";

import { EmptyState } from "@components/empty-state";
import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function SessionsListView() {
  const navigate = useNavigate();
  const { data: sessions } = useSuspenseQuery(sessionsListQueryOptions());
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);
  const filteredSessions = sessions.filter((session) => {
    const haystack = [
      session.title,
      session.slug,
      session.description,
      session.tags.map((tag) => tag.name).join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(deferredSearch.toLowerCase());
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div className="admin-kicker">Sessions</div>
        <h2>Lectura completa y edición persistente de sesiones.</h2>
        <p>
          Busca por título, slug o tags y entra al editor completo con fotos relacionadas y control
          de slug final tras guardar.
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
              placeholder="Buscar sesiones por título, slug o tag"
              value={searchValue}
            />
          </div>
          <mc-button
            className="admin-inline-button"
            onClick={() => {
              void navigate({ to: "/sessions/new" });
            }}
            variant="primary"
          >
            Nueva sesión
          </mc-button>
        </div>

        {filteredSessions.length > 0 ? (
          <McResourceTable
            columns={[
              { id: "title", label: "Título", sortable: true },
              { id: "slug", label: "Slug" },
              { id: "tags", label: "Tags" },
              { id: "photos", label: "Fotos", align: "end", sortable: true, width: "96px" },
              { id: "createdAt", label: "Creada" },
            ]}
            onMcRowSelect={(event) => {
              void navigate({
                to: "/sessions/$slug",
                params: { slug: event.detail.selectedId },
              });
            }}
            rows={filteredSessions.map((session) => ({
              id: session.slug,
              cells: {
                title: session.title,
                slug: session.slug,
                tags: session.tags.map((tag) => tag.name).join(", "),
                photos: session.photos?.length ?? 0,
                createdAt: formatDate(session.createdAt),
              },
            }))}
          />
        ) : (
          <EmptyState
            action={
              <mc-button
                className="admin-inline-button"
                onClick={() => {
                  void navigate({ to: "/sessions/new" });
                }}
                variant="primary"
              >
                Crear sesión
              </mc-button>
            }
            description="Ajusta la búsqueda o abre una sesión nueva para empezar a poblar el portfolio."
            title="No hay sesiones que coincidan"
          />
        )}
      </section>
    </div>
  );
}
