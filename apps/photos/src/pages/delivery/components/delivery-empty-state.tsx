interface DeliveryEmptyStateProps {
  title: string;
}

export function DeliveryEmptyState({ title }: DeliveryEmptyStateProps) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center px-8">
      <div className="max-w-lg rounded-2xl border ui-divider bg-[color:var(--color-surface)] p-6 text-center shadow-[var(--shadow-soft)]">
        <p className="ui-kicker">Entrega de fotos</p>
        <h1 className="editorial-heading mt-2">{title}</h1>
        <p className="ui-muted mt-3 text-sm leading-relaxed">
          Esta entrega todavía no tiene fotografías disponibles.
        </p>
      </div>
    </div>
  );
}
