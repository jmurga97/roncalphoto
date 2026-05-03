import { tagDetailQueryOptions } from "@lib/api/tags/query-options";
import { McInlineMessage, McRelationshipPanel } from "@murga/components/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";

export function TagDetailView() {
  const navigate = useNavigate();
  const params = useParams({ from: "/_auth/tags/$slug" });
  const { data } = useSuspenseQuery(tagDetailQueryOptions(params.slug));

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div className="admin-kicker">Tag detail</div>
        <h2>{data.tag.name}</h2>
        <p>
          Slug <strong>{data.tag.slug}</strong>. Esta vista mantiene la relación completa de
          sesiones sin edición directa de taxonomía.
        </p>
      </header>

      <McInlineMessage
        message="Puedes navegar a las sesiones relacionadas para editar copy, slug, tags o fotos asociadas."
        title="Solo lectura"
        tone="idle"
      />

      <McRelationshipPanel
        emptyLabel="No hay sesiones vinculadas a este tag."
        items={data.sessions.map((session) => ({
          id: session.slug,
          label: session.title,
        }))}
        onMcSelect={(event) => {
          navigate({
            to: "/sessions/$slug",
            params: { slug: event.detail.selectedId },
          });
        }}
        title="Sesiones relacionadas"
      />
    </div>
  );
}
