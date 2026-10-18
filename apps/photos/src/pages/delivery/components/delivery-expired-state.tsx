import { StateCard } from "@components/state-card";

interface DeliveryExpiredStateProps {
  title: string;
}

export function DeliveryExpiredState({ title }: DeliveryExpiredStateProps) {
  return (
    <StateCard
      className="text-center"
      description="Las fotografías de esta entrega ya no están disponibles. Las imágenes se conservan durante 90 días. Si necesitas acceder a ellas de nuevo, ponte en contacto con el estudio."
      headingLevel="h1"
      kicker="Entrega caducada"
      title={title}
    />
  );
}
