interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Cargando contenido..." }: LoadingStateProps) {
  return (
    <div className="photo-stage flex h-full min-h-0 items-center justify-center px-8">
      <div className="gallery-loader flex items-center gap-3 rounded-full border ui-divider px-5 py-3">
        <div className="gallery-loader-dot h-5 w-5 animate-spin rounded-full border-2" />
        <p className="ui-muted text-sm">{label}</p>
      </div>
    </div>
  );
}
