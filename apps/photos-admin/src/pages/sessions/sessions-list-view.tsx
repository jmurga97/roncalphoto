import { Button, ResourceTable, SearchField, TagList } from "@jmurga97/components";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";

import { PageHeader } from "@components/page-header";
import { trpc } from "@lib/api/client";

export function SessionsListView() {
  const navigate = useNavigate();
  const { data: sessions, isFetching } = useSuspenseQuery(trpc.sessions.list.queryOptions());
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue).toLowerCase();
  const filteredSessions = sessions.filter((session) =>
    [session.title, session.slug, session.description, session.tags.map((tag) => tag.name).join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(deferredSearch),
  );

  return (
    <div className="ming-page">
      <PageHeader
        title="Sesiones"
        description="Organiza las sesiones del portfolio y sus fotos."
        actions={
          <Button nativeButton={false} render={<Link to="/sessions/new" />}>
            Crear sesión
          </Button>
        }
      />
      <section className="admin-table-shell">
        <div className="ming-toolbar">
          <SearchField
            className="ming-toolbar__search"
            aria-label="Buscar sesiones"
            clearLabel="Borrar búsqueda"
            onValueChange={setSearchValue}
            placeholder="Buscar por título, slug o etiqueta"
            value={searchValue}
          />
          <span className="ming-toolbar__end ming-data">
            {filteredSessions.length} {filteredSessions.length === 1 ? "sesión" : "sesiones"}
          </span>
        </div>
        <ResourceTable
          ariaLabel="Sesiones"
          rows={filteredSessions}
          responsive="stacked"
          refetching={isFetching}
          refetchingLabel="Actualizando sesiones…"
          getRowId={(session) => session.id}
          emptyState={
            searchValue
              ? "No hay sesiones que coincidan. Prueba con otra búsqueda."
              : "Todavía no hay sesiones. Crea la primera para organizar tus fotos."
          }
          columns={[
            {
              id: "title",
              header: "Sesión",
              render: (session) => <span className="[overflow-wrap:anywhere]">{session.title}</span>,
            },
            {
              id: "tags",
              header: "Etiquetas",
              render: (session) => (
                <TagList
                  items={[
                    ...session.tags.slice(0, 3).map((tag) => ({ id: tag.id, label: tag.name })),
                    ...(session.tags.length > 3 ? [{ id: "more", label: `+${session.tags.length - 3}` }] : []),
                  ]}
                />
              ),
            },
            {
              id: "photos",
              header: "Fotos",
              align: "end",
              render: (session) => new Intl.NumberFormat("es-ES").format(session.photoCount),
            },
            {
              id: "createdAt",
              header: "Creada",
              render: (session) => (
                <span className="whitespace-nowrap">
                  {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(session.createdAt))}
                </span>
              ),
            },
          ]}
          onRowActivate={(session) => {
            void navigate({ to: "/sessions/$slug", params: { slug: session.slug } });
          }}
        />
      </section>
    </div>
  );
}
