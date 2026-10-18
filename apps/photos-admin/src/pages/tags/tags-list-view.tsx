import { InlineMessage, ResourceTable, SearchField } from "@jmurga97/components";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";

import { PageHeader } from "@components/page-header";
import { trpc } from "@lib/api/client";

export function TagsListView() {
  const navigate = useNavigate();
  const { data: tags, isFetching } = useSuspenseQuery(trpc.tags.list.queryOptions());
  const { data: sessions } = useSuspenseQuery(trpc.sessions.list.queryOptions());
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue).toLowerCase();
  const filteredTags = tags.filter((tag) => `${tag.name} ${tag.slug}`.toLowerCase().includes(deferredSearch));

  return (
    <div className="ming-page">
      <PageHeader title="Etiquetas" description="Explora las etiquetas y las sesiones relacionadas." />
      <section className="admin-table-shell">
        <InlineMessage
          title="Solo lectura"
          message="Asigna etiquetas desde el editor de cada sesión. La creación y eliminación de etiquetas todavía no están disponibles."
        />
        <div className="ming-toolbar">
          <SearchField
            className="ming-toolbar__search"
            aria-label="Buscar etiquetas"
            clearLabel="Borrar búsqueda"
            onValueChange={setSearchValue}
            placeholder="Buscar por nombre o slug"
            value={searchValue}
          />
          <span className="ming-toolbar__end ming-data">
            {filteredTags.length} {filteredTags.length === 1 ? "etiqueta" : "etiquetas"}
          </span>
        </div>
        <ResourceTable
          ariaLabel="Etiquetas"
          rows={filteredTags}
          responsive="stacked"
          refetching={isFetching}
          refetchingLabel="Actualizando etiquetas…"
          getRowId={(tag) => tag.id}
          columns={[
            { id: "name", header: "Etiqueta", render: (tag) => tag.name },
            {
              id: "slug",
              header: "Slug",
              render: (tag) => <span className="ming-data">{tag.slug}</span>,
            },
            {
              id: "sessions",
              header: "Sesiones",
              align: "end",
              render: (tag) => sessions.filter((session) => session.tags.some((item) => item.id === tag.id)).length,
            },
          ]}
          emptyState={
            searchValue ? "No hay etiquetas que coincidan. Prueba con otra búsqueda." : "Todavía no hay etiquetas."
          }
          onRowActivate={(tag) => {
            void navigate({ to: "/tags/$slug", params: { slug: tag.slug } });
          }}
        />
      </section>
    </div>
  );
}
