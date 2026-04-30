import { sessionsListQueryOptions } from "@lib/api/sessions/query-options";
import { tagsListQueryOptions } from "@lib/api/tags/query-options";
import { McButton, McOverviewPanel } from "@murga/components/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function OverviewView() {
  const navigate = useNavigate();
  const { data: sessions } = useSuspenseQuery(sessionsListQueryOptions());
  const { data: tags } = useSuspenseQuery(tagsListQueryOptions());
  const totalPhotos = sessions.reduce((sum, session) => sum + (session.photos?.length ?? 0), 0);
  const recentSessions = [...sessions]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 4);

  return (
    <div className="admin-page admin-overview-grid">
      <section className="admin-overview-grid">
        <div className="admin-page-header">
          <div className="admin-kicker">Overview</div>
          <h2>Todo el portfolio en una sola vista.</h2>
          <p>
            Métricas reales de sesiones, fotos y tags combinadas con accesos rápidos para arrancar
            edición o revisión sin salir del shell persistente.
          </p>
        </div>
        <div className="admin-surface">
          <McOverviewPanel
            description="Datos vivos del backend: sesiones con fotos, tags y relación general del portfolio."
            stats={[
              {
                id: "sessions",
                label: "Sesiones",
                value: String(sessions.length),
                status: "success",
              },
              {
                id: "photos",
                label: "Fotos",
                value: String(totalPhotos),
                status: "success",
              },
              {
                id: "tags",
                label: "Tags",
                value: String(tags.length),
                status: "success",
              },
            ]}
            status={{ label: "Live data", tone: "success" }}
            title="Portfolio health"
          />
        </div>
      </section>

      <aside className="admin-overview-secondary">
        <section className="admin-card">
          <div className="admin-kicker">Actividad reciente</div>
          <h3>Últimas sesiones activas</h3>
          <ul className="admin-list">
            {recentSessions.map((session) => (
              <li key={session.id} className="admin-list-item">
                <span className="admin-list-label">{session.title}</span>
                <span className="admin-list-meta">{formatDate(session.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-card">
          <div className="admin-kicker">Accesos rápidos</div>
          <h3>Flujos más usados en v1</h3>
          <div className="admin-toolbar-controls">
            <McButton
              className="admin-inline-button"
              onClick={() => {
                navigate({ to: "/sessions/new" });
              }}
              variant="primary"
            >
              Nueva sesión
            </McButton>
            <McButton
              className="admin-inline-button"
              onClick={() => {
                navigate({ to: "/photos/new", search: { page: 1 } });
              }}
              variant="secondary"
            >
              Nueva foto
            </McButton>
          </div>
        </section>
      </aside>
    </div>
  );
}
