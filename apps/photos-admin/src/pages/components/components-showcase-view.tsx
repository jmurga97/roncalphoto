import {
  McAppShell,
  McBadge,
  McButton,
  McCheckbox,
  McConfirmAction,
  McField,
  McInlineMessage,
  McInput,
  McMediaBrowser,
  McNavList,
  McOverviewPanel,
  McPagination,
  McRelationshipPanel,
  McResourceEditor,
  McResourceTable,
  McSearchField,
  McSelect,
  McSidebarNav,
  McStatusText,
  McTagList,
  McTagPicker,
  McTextarea,
  McThumbnail,
  McThumbnailRail,
} from "@murga/components/react";

const tagOptions = [
  { id: "wedding", label: "Wedding", description: "Cobertura principal" },
  { id: "editorial", label: "Editorial", description: "Serie dirigida" },
  { id: "film", label: "Film", description: "Proceso analógico" },
];

const navItems = [
  { id: "overview", label: "Overview", current: true },
  { id: "sessions", label: "Sessions", count: 24 },
  { id: "photos", label: "Photos", count: 182 },
];

const tableColumns = [
  { id: "title", label: "Title", sortable: true },
  { id: "format", label: "Format" },
  { id: "status", label: "Status", align: "end" as const },
];

const tableRows = [
  {
    id: "row-1",
    selected: true,
    cells: { title: "Lisbon Afterglow", format: "Landscape", status: "Published" },
  },
  {
    id: "row-2",
    cells: { title: "Studio Portrait 03", format: "Portrait", status: "Draft" },
  },
];

const thumbnails = [
  { id: "thumb-1", src: buildPreview("#111111", "Cover"), alt: "Sample cover image" },
  { id: "thumb-2", src: buildPreview("#1a1a1a", "Detail"), alt: "Sample detail image" },
  { id: "thumb-3", src: buildPreview("#000000", "Night"), alt: "Sample night image" },
];

const tagItems = [
  { id: "tag-1", label: "Madrid" },
  { id: "tag-2", label: "Golden hour" },
  { id: "tag-3", label: "35mm" },
];

const mediaItems = thumbnails.map((item, index) => ({
  id: item.id,
  src: item.src,
  thumbnailSrc: item.src,
  alt: item.alt,
  caption: `Frame ${index + 1} · selección curada para el dashboard`,
}));

function buildPreview(background: string, label: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="${background}" />
      <circle cx="940" cy="180" r="120" fill="#333333" />
      <path d="M0 760 L430 420 L670 610 L1200 180 L1200 900 L0 900 Z" fill="#222222" />
      <text x="72" y="810" fill="#e8e8e8" font-family="Space Grotesk, sans-serif" font-size="84" letter-spacing="10">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function ComponentsShowcaseView() {
  return (
    <div className="admin-page admin-components-page">
      <section className="admin-page-header">
        <div className="admin-kicker">Component Library</div>
        <h2>Showcase visual de @murga/components</h2>
        <p>
          Vista dummy sin lógica para revisar estados, composición y jerarquía visual de todos los
          componentes actuales desde PhotoAdmin.
        </p>
      </section>

      <section className="admin-components-grid">
        <article className="admin-card admin-showcase-card">
          <div className="admin-kicker">Actions</div>
          <h3>Botones, badges y estados</h3>
          <div className="admin-showcase-stack">
            <div className="admin-showcase-inline">
              <McButton variant="primary">Guardar cambios</McButton>
              <McButton variant="secondary">Acción secundaria</McButton>
              <McButton variant="ghost">Ghost</McButton>
              <McButton pending variant="destructive">
                Eliminar
              </McButton>
            </div>
            <div className="admin-showcase-inline">
              <McBadge tone="default">Default</McBadge>
              <McBadge tone="accent">Accent</McBadge>
              <McBadge tone="success">Success</McBadge>
              <McBadge tone="warning">Warning</McBadge>
              <McBadge tone="error">Error</McBadge>
            </div>
            <div className="admin-showcase-inline">
              <McStatusText label="Sincronizado con D1" tone="success" />
              <McStatusText label="Requiere revisión" tone="loading" />
              <McStatusText label="Incidencia de subida" tone="error" />
            </div>
            <McInlineMessage
              message="Este bloque permite revisar tonos y densidad visual."
              title="Message preview"
              tone="idle"
            />
          </div>
        </article>

        <article className="admin-card admin-showcase-card">
          <div className="admin-kicker">Form Controls</div>
          <h3>Inputs básicos y composición de campo</h3>
          <div className="admin-showcase-stack">
            <McField
              hint="Se utiliza para la portada pública de la sesión."
              inputId="component-title"
              label="Título"
              required
            >
              <McInput inputId="component-title" placeholder="Lisbon Afterglow" value="" />
            </McField>
            <div className="admin-showcase-two-column">
              <McField
                className="admin-showcase-floating-control"
                inputId="component-select"
                label="Tag principal"
              >
                <McSelect
                  inputId="component-select"
                  open
                  options={tagOptions}
                  placeholder="Selecciona un tag"
                  selectedId="editorial"
                />
              </McField>
              <McField
                className="admin-showcase-floating-control"
                inputId="component-tags"
                label="Tags relacionados"
              >
                <McTagPicker
                  inputId="component-tags"
                  open
                  options={tagOptions}
                  selectedIds={["wedding", "film"]}
                />
              </McField>
            </div>
            <McField
              hint="Copy descriptivo para SEO, teaser o detalle curatorial."
              inputId="component-description"
              label="Descripción"
              optional
            >
              <McTextarea
                inputId="component-description"
                rows={4}
                value="Serie editorial con transición de luz natural a tungsteno."
              />
            </McField>
            <div className="admin-showcase-inline admin-showcase-inline--spread">
              <McSearchField placeholder="Buscar sesión o foto" value="editorial" />
              <McCheckbox ariaLabel="Marcar como destacada" checked />
            </div>
          </div>
        </article>

        <article className="admin-card admin-showcase-card">
          <div className="admin-kicker">Navigation</div>
          <h3>Navegación y relaciones</h3>
          <div className="admin-showcase-stack">
            <McNavList ariaLabel="Main navigation" items={navItems} orientation="horizontal" />
            <McSidebarNav
              ariaLabel="Showcase navigation"
              footerItems={[
                { id: "public-site", label: "Ver sitio", description: "Abrir portfolio publico" },
                { id: "logout", label: "Logout", description: "Cerrar sesion del dashboard" },
              ]}
              items={navItems}
              open={false}
              secondaryItems={[{ id: "settings", label: "Settings" }]}
            >
              <div slot="header" className="admin-sidebar-identity">
                <div className="admin-sidebar-kicker">Dashboard</div>
                <div className="admin-sidebar-title">RoncalPhoto</div>
                <p className="admin-sidebar-copy">Shell persistente con navegación editorial.</p>
              </div>
              <div slot="footer" className="admin-sidebar-footer">
                <McStatusText label="182 fotos activas" tone="success" />
              </div>
            </McSidebarNav>
            <McRelationshipPanel
              items={[
                { id: "rel-1", label: "Editorial Otoño", count: 18 },
                { id: "rel-2", label: "Bodas 2025", count: 42 },
              ]}
              title="Colecciones relacionadas"
            >
              <div slot="header" className="admin-kicker">
                Related sets
              </div>
            </McRelationshipPanel>
          </div>
        </article>

        <article className="admin-card admin-showcase-card">
          <div className="admin-kicker">Data Display</div>
          <h3>Resumen, tabla y paginación</h3>
          <div className="admin-showcase-stack">
            <McOverviewPanel
              description="Resumen rápido de sesiones, fotos y tags en una misma superficie."
              stats={[
                { id: "sessions", label: "Sessions", value: "24", status: "success" },
                { id: "photos", label: "Photos", value: "182", status: "success" },
                { id: "tags", label: "Tags", value: "36", status: "loading" },
              ]}
              status={{ label: "Live data", tone: "success" }}
              title="Portfolio Health"
            >
              <div slot="content" className="admin-copy">
                Estado general del portfolio con tono visual similar al dashboard principal.
              </div>
            </McOverviewPanel>
            <McResourceTable columns={tableColumns} rows={tableRows} selectedId="row-1" />
            <McPagination hasMore page={2} pageSize={24} total={182} />
          </div>
        </article>

        <article className="admin-card admin-showcase-card">
          <div className="admin-kicker">Media</div>
          <h3>Thumbnails y media browser</h3>
          <div className="admin-showcase-stack">
            <div className="admin-showcase-inline">
              <McThumbnail
                alt={thumbnails[0].alt}
                itemId={thumbnails[0].id}
                ratio="landscape"
                selected
                src={thumbnails[0].src}
              />
              <McThumbnail
                alt={thumbnails[1].alt}
                itemId={thumbnails[1].id}
                ratio="portrait"
                src={thumbnails[1].src}
              />
              <McThumbnail
                alt={thumbnails[2].alt}
                itemId={thumbnails[2].id}
                ratio="square"
                src={thumbnails[2].src}
              />
            </div>
            <McThumbnailRail
              ariaLabel="Gallery thumbnails"
              items={mediaItems}
              selectedId="thumb-1"
            />
            <McMediaBrowser items={mediaItems} selectedId="thumb-1" />
          </div>
        </article>

        <article className="admin-card admin-showcase-card">
          <div className="admin-kicker">Editing Shells</div>
          <h3>Editor, confirmación y app shell</h3>
          <div className="admin-showcase-stack">
            <McResourceEditor
              dirty
              resourceTitle="Session editor"
              status={{ label: "Draft autosaved", tone: "success" }}
            >
              <div slot="fields" className="admin-showcase-stack">
                <McField inputId="editor-title" label="Título de sesión">
                  <McInput inputId="editor-title" value="Editorial Lisboa" />
                </McField>
                <McField inputId="editor-notes" label="Notas internas" optional>
                  <McTextarea
                    inputId="editor-notes"
                    rows={3}
                    value="Secuencia pensada para portada y detalle."
                  />
                </McField>
              </div>
              <div slot="aside" className="admin-showcase-stack">
                <McTagList interactive items={tagItems} selectedIds={["tag-1", "tag-3"]} />
              </div>
            </McResourceEditor>
            <McConfirmAction
              confirmLabel="Publicar"
              message="Este es un preview estático del modal de confirmación."
              open={false}
              tone="success"
            />
            <div className="admin-shell-preview">
              <McAppShell mobileOverlay={false} sidebarOpen>
                <div slot="sidebar" className="admin-showcase-shell-slot">
                  <McSidebarNav items={navItems} open={false} title="Preview shell" />
                </div>
                <div slot="header" className="admin-showcase-shell-header">
                  Shell header
                </div>
                <div slot="main" className="admin-showcase-shell-main">
                  Shell main content
                </div>
                <div slot="footer" className="admin-showcase-shell-footer">
                  Shell footer
                </div>
              </McAppShell>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
