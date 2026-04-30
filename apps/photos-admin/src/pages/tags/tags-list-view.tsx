import { EmptyState } from "@components/empty-state";
import { tagsListQueryOptions } from "@lib/api/tags/query-options";
import { McInlineMessage, McResourceTable, McSearchField } from "@murga/components/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";

export function TagsListView() {
  const navigate = useNavigate();
  const { data: tags } = useSuspenseQuery(tagsListQueryOptions());
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);
  const filteredTags = tags.filter((tag) => {
    const haystack = `${tag.name} ${tag.slug}`.toLowerCase();
    return haystack.includes(deferredSearch.toLowerCase());
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div className="admin-kicker">Tags</div>
        <h2>Vista de solo lectura para taxonomía y navegación cruzada.</h2>
        <p>
          En esta iteración no hay CRUD de tags. Puedes revisar el inventario completo y saltar a
          las sesiones relacionadas.
        </p>
      </header>

      <McInlineMessage
        message="La v1 mantiene tags en modo lectura porque la API pública todavía no expone mutaciones."
        title="Tags read-only"
        tone="loading"
      />

      <section className="admin-table-shell">
        <McSearchField
          onMcChange={(event) => {
            setSearchValue(event.detail.value);
          }}
          onMcClear={() => {
            setSearchValue("");
          }}
          placeholder="Buscar tags por nombre o slug"
          value={searchValue}
        />

        {filteredTags.length > 0 ? (
          <McResourceTable
            columns={[
              { id: "name", label: "Nombre" },
              { id: "slug", label: "Slug" },
            ]}
            onMcRowSelect={(event) => {
              navigate({
                to: "/tags/$slug",
                params: { slug: event.detail.selectedId },
              });
            }}
            rows={filteredTags.map((tag) => ({
              id: tag.slug,
              cells: {
                name: tag.name,
                slug: tag.slug,
              },
            }))}
          />
        ) : (
          <EmptyState
            description="No se encontraron tags con ese nombre o slug."
            title="Sin resultados"
          />
        )}
      </section>
    </div>
  );
}
