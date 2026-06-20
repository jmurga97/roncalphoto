import { useSuspenseQuery } from "@tanstack/react-query";

import { DeliveryDetailPhotoItem } from "@components/deliveries/delivery-detail-photo-item";
import { deliveryDetailQueryOptions } from "@lib/deliveries/detail-query";

interface DeliveryDetailPanelProps {
  deliveryId: string;
  photoCount: number;
}

export default function DeliveryDetailPanel({ deliveryId, photoCount }: DeliveryDetailPanelProps) {
  const { data: photos } = useSuspenseQuery(deliveryDetailQueryOptions(deliveryId, photoCount));

  return (
    <div className="grid gap-3">
      <div className="admin-kicker">
        Fotos de la entrega · {photos.length} {photos.length === 1 ? "imagen" : "imágenes"}
      </div>
      <ul className="m-0 grid list-none gap-2 p-0">
        {photos.map((photo) => (
          <DeliveryDetailPhotoItem key={photo.id} photo={photo} />
        ))}
      </ul>
    </div>
  );
}
