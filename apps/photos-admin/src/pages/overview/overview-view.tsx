import { Button, OverviewPanel, ResourceTable, TagList } from "@jmurga97/components";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

import { PageHeader } from "@components/page-header";
import { trpc } from "@lib/api/client";

export function OverviewView({ userEmail }: { userEmail: string }) {
  const navigate = useNavigate();
  const { data: sessions, isFetching } = useSuspenseQuery(trpc.sessions.list.queryOptions());
  const { data: tags } = useSuspenseQuery(trpc.tags.list.queryOptions());
  const totalPhotos = sessions.reduce((sum, session) => sum + session.photos.length, 0);
  const recentSessions = sessions.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const format = new Intl.NumberFormat("es-ES");

  return (
    <div className="ming-page">
      <PageHeader
        title="Resumen"
        description={`Tu portfolio, de un vistazo · ${userEmail}`}
        actions={
          <Button nativeButton={false} render={<Link to="/photos/new" />}>
            Subir fotos
          </Button>
        }
      />
      <OverviewPanel
        title="Portfolio"
        description="Sesiones, imágenes y etiquetas publicadas"
        stats={[
          { id: "sessions", label: "Sesiones", value: format.format(sessions.length) },
          { id: "photos", label: "Fotos", value: format.format(totalPhotos) },
          { id: "tags", label: "Etiquetas", value: format.format(tags.length) },
        ]}
      />
      <div className="ming-split">
        <section className="ming-section" aria-labelledby="recent-sessions">
          <div className="ming-cluster ming-cluster--between">
            <h2 id="recent-sessions" className="ming-section__title">
              Sesiones recientes
            </h2>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/sessions" />}>
              Ver sesiones
            </Button>
          </div>
          <ResourceTable
            ariaLabel="Sesiones recientes"
            density="compact"
            rows={recentSessions}
            getRowId={(row) => row.id}
            refetching={isFetching}
            refetchingLabel="Actualizando sesiones…"
            responsive="stacked"
            columns={[
              { id: "title", header: "Sesión", render: (row) => row.title },
              {
                id: "photos",
                header: "Fotos",
                align: "end",
                render: (row) => format.format(row.photos.length),
              },
              {
                id: "date",
                header: "Creada",
                render: (row) =>
                  new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(row.createdAt)),
              },
            ]}
            onRowActivate={(row) => {
              void navigate({ to: "/sessions/$slug", params: { slug: row.slug } });
            }}
            emptyState="Todavía no hay sesiones. Crea la primera para organizar tus fotos."
          />
        </section>
        <div className="admin-overview-secondary">
          <section className="admin-card">
            <h2>Organiza tu portfolio</h2>
            <p>Crea una sesión y añade las imágenes que forman parte de ella.</p>
            <Button
              className="admin-inline-button"
              variant="secondary"
              nativeButton={false}
              render={<Link to="/sessions/new" />}
            >
              Crear sesión
            </Button>
          </section>
          <section className="admin-card">
            <h2>Etiquetas</h2>
            {tags.length > 0 ? (
              <TagList items={tags.slice(0, 8).map((tag) => ({ id: tag.id, label: tag.name }))} />
            ) : (
              <p>Aún no hay etiquetas.</p>
            )}
            <Button
              className="admin-inline-button"
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link to="/tags" />}
            >
              Ver etiquetas
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
