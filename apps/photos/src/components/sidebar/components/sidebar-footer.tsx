import { useTheme, useThemeActions } from "@app/store";

export function SidebarFooter() {
  const theme = useTheme();
  const { toggleTheme } = useThemeActions();

  return (
    <footer className="mt-auto border-t pt-6 ui-divider">
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
    </footer>
  );
}
