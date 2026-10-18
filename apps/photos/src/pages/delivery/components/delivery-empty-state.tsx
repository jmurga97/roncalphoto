import { StateCard } from "@components/state-card";

interface DeliveryEmptyStateProps {
  title: string;
}

export function DeliveryEmptyState({ title }: DeliveryEmptyStateProps) {
  return (
    <StateCard
      className="text-center"
      description="Esta entrega todavía no tiene fotografías disponibles."
      headingLevel="h1"
      kicker="Entrega de fotos"
      title={title}
    />
  );
}
