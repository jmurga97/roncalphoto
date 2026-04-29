import { ABOUT_PANEL_ID, ABOUT_TRIGGER_ID } from "@/pages/about/constants";
import { useSidebarAboutOpen, useSidebarActions, useTheme, useThemeActions } from "@app/store";

export function SidebarFooter() {
  const isAboutOpen = useSidebarAboutOpen();
  const theme = useTheme();
  const { toggleAbout } = useSidebarActions();
  const { toggleTheme } = useThemeActions();

  return (
    <footer className="mt-auto border-t pt-6 ui-divider">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <p className="ui-muted text-xs">Estudio</p>
          <button
            aria-controls={ABOUT_PANEL_ID}
            aria-expanded={isAboutOpen}
            className="rounded-md border ui-divider px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ui-link"
            id={ABOUT_TRIGGER_ID}
            onClick={toggleAbout}
            type="button"
          >
            Sobre nosotros
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="ui-muted text-xs">Modo visual</p>
          <button
            aria-label="Cambiar tema"
            className="rounded-md border ui-divider px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ui-link"
            onClick={toggleTheme}
            type="button"
          >
            {theme === "dark" ? "Tema oscuro" : "Tema claro"}
          </button>
        </div>
      </div>
    </footer>
  );
}
