export function LoadingState({ label = "Cargando dashboard..." }: { label?: string }) {
  return (
    <div className="admin-state-shell">
      <div className="admin-state-eyebrow">Cargando</div>
      <h2>{label}</h2>
      <p>Preparando sesiones, fotos y tags desde D1.</p>
    </div>
  );
}
