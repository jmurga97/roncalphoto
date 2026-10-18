import { Link } from "@tanstack/react-router";

import { StateCard } from "./state-card";

export function NotFoundState() {
  return (
    <StateCard
      description="La ruta no existe o ya no está disponible."
      kicker="404"
      title="No hemos encontrado esta sesión."
    >
      <Link
        className="mt-4 inline-flex rounded-md border ui-divider px-4 py-2 text-sm font-semibold"
        search={{ photo: undefined, tag: undefined }}
        to="/"
      >
        Volver al inicio
      </Link>
    </StateCard>
  );
}
