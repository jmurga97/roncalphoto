import { DropdownMenu } from "@jmurga97/components";

interface DeliveryRowMenuProps {
  deliveryTitle: string;
  expanded: boolean;
  onToggleDetail: () => void;
}

export function DeliveryRowMenu({ deliveryTitle, expanded, onToggleDetail }: DeliveryRowMenuProps) {
  return (
    <DropdownMenu
      align="end"
      ariaLabel={`Acciones para ${deliveryTitle}`}
      items={[
        {
          id: "toggle-detail",
          label: expanded ? "Ocultar detalle" : "Más detalle",
          onSelect: onToggleDetail,
        },
      ]}
      trigger={<span aria-hidden="true">⋯</span>}
    />
  );
}
