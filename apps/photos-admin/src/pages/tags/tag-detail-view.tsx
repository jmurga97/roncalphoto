import { InlineMessage, RelationshipPanel } from "@jmurga97/components";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";

import { PageHeader } from "@components/page-header";
import { trpc } from "@lib/api/client";

export function TagDetailView() {
  const navigate = useNavigate();
  const params = useParams({ from: "/_auth/tags/$slug" });
  const { data } = useSuspenseQuery(trpc.tags.get.queryOptions({ slug: params.slug }));

  return (
    <div className="ming-page">
      <PageHeader title={data.tag.name} description={`Etiqueta · ${data.tag.slug}`} />

      <InlineMessage
        message="Abre una sesión para editar su contenido, sus etiquetas o sus fotos."
        title="Solo lectura"
        tone="info"
      />

      <RelationshipPanel
        emptyLabel="No hay sesiones vinculadas a esta etiqueta."
        items={data.sessions.map((session) => ({
          id: session.slug,
          label: session.title,
        }))}
        onValueChange={(selectedId) => {
          void navigate({
            to: "/sessions/$slug",
            params: { slug: selectedId },
          });
        }}
        title="Sesiones relacionadas"
      />
    </div>
  );
}
