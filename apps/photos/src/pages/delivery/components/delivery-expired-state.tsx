interface DeliveryExpiredStateProps {
  title: string;
}

export function DeliveryExpiredState({ title }: DeliveryExpiredStateProps) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center px-8">
      <div className="max-w-lg rounded-2xl border ui-divider bg-[color:var(--color-surface)] p-6 text-center shadow-[var(--shadow-soft)]">
        <p className="ui-kicker">Entrega caducada</p>
        <h1 className="editorial-heading mt-2">{title}</h1>
        <p className="ui-muted mt-3 text-sm leading-relaxed">
          Las fotografías de esta entrega ya no están disponibles. Las imágenes se conservan durante
          90 días. Si necesitas acceder a ellas de nuevo, ponte en contacto con el estudio.
        </p>
      </div>
    </div>
  );
}
