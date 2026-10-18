import { ErrorComponent } from "@tanstack/react-router";

import { StateCard } from "@components/state-card";

import type { ErrorComponentProps } from "@tanstack/react-router";

export function RouteErrorState({ error, reset }: ErrorComponentProps) {
  return (
    <StateCard
      description="Puedes volver a intentarlo o regresar a la navegación principal."
      kicker="Error"
      title="No hemos podido cargar esta vista."
    >
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
    </StateCard>
  );
}
