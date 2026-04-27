import { Link } from "@tanstack/react-router";

export function NotFoundState() {
  return (
    <div className="photo-stage flex h-full min-h-0 items-center justify-center px-8">
      <div className="max-w-lg rounded-2xl border ui-divider bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
        <p className="ui-kicker">404</p>
        <h2 className="editorial-heading mt-2">No hemos encontrado esta sesión.</h2>
        <p className="ui-muted mt-3 text-sm leading-relaxed">
          La ruta no existe o ya no está disponible.
        </p>
        <Link
          className="mt-4 inline-flex rounded-md border ui-divider px-4 py-2 text-sm font-semibold"
          to="/"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
