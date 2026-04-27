import { ErrorComponent, type ErrorComponentProps } from "@tanstack/react-router";

export function RouteErrorState({ error, reset }: ErrorComponentProps) {
  return (
    <div className="photo-stage flex h-full min-h-0 items-center justify-center px-8">
      <div className="max-w-lg rounded-2xl border ui-divider bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
        <p className="ui-kicker">Error</p>
        <h2 className="editorial-heading mt-2">No hemos podido cargar esta vista.</h2>
        <p className="ui-muted mt-3 text-sm leading-relaxed">
          Puedes volver a intentarlo o regresar a la navegación principal.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="rounded-md border ui-divider px-4 py-2 text-sm font-semibold"
            onClick={() => reset()}
            type="button"
          >
            Reintentar
          </button>
        </div>
        <div className="mt-4 text-xs">
          <ErrorComponent error={error} />
        </div>
      </div>
    </div>
  );
}
