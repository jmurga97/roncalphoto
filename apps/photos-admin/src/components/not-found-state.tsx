import { Link } from "@tanstack/react-router";

export function NotFoundState() {
  return (
    <div className="admin-state-shell">
      <div className="admin-state-eyebrow">404</div>
      <h2>Esta ruta no existe en el dashboard.</h2>
      <p>Puedes volver al overview o entrar directamente en sesiones, fotos o tags.</p>
      <Link className="admin-link" to="/">
        Ir al overview
      </Link>
    </div>
  );
}
