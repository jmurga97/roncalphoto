import { ABOUT_PANEL_CLOSING, ABOUT_PANEL_INTRO, ABOUT_PANEL_SECTIONS } from "../content";

interface AboutPanelContentProps {
  titleId: string;
}

export function AboutPanelContent({ titleId }: AboutPanelContentProps) {
  return (
    <div className="flex flex-col gap-8">
      <header className="border-b pb-6 ui-divider">
        <p className="ui-kicker">{ABOUT_PANEL_INTRO.kicker}</p>
        <h2 className="editorial-title mt-3 max-w-4xl" id={titleId}>
          {ABOUT_PANEL_INTRO.title}
        </h2>
        <div className="editorial-prose mt-4 max-w-3xl">
          {ABOUT_PANEL_INTRO.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {ABOUT_PANEL_SECTIONS.map((section) => (
          <section
            className="rounded-[1.1rem] border px-5 py-5 ui-divider bg-[color-mix(in_srgb,var(--color-surface)_82%,transparent)]"
            key={section.id}
          >
            <p className="ui-kicker">{section.kicker}</p>
            <h3 className="editorial-heading mt-2">{section.title}</h3>
            <div className="editorial-prose mt-3">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="grid gap-6 border-t pt-6 ui-divider lg:grid-cols-[minmax(0,1.15fr)_minmax(15rem,0.85fr)]">
        <div className="editorial-prose max-w-3xl">
          {ABOUT_PANEL_CLOSING.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <aside className="rounded-[1.1rem] border px-5 py-5 ui-divider bg-[color-mix(in_srgb,var(--color-surface-2)_54%,transparent)]">
          <p className="ui-kicker">Nuestra mirada</p>
          <p className="editorial-heading mt-2">
            La imagen final importa, pero también la sensibilidad con la que se llega hasta ella.
          </p>
        </aside>
      </section>
    </div>
  );
}
