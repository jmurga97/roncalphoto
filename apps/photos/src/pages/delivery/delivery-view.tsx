import { useState } from "react";

import { DeliveryEmptyState } from "./components/delivery-empty-state";
import { DeliveryExpiredState } from "./components/delivery-expired-state";
import { DeliveryGallery } from "./components/delivery-gallery";
import { DeliveryList } from "./components/delivery-list";
import { DeliveryViewToggle } from "./components/delivery-view-toggle";
import { useDeliverySelection } from "./hooks/use-delivery-selection";
import { useDeliveryViewModel } from "./hooks/use-delivery-view-model";

import type { DeliveryViewMode } from "./types";

export function DeliveryView() {
  const { token, title, photosAvailable, photos } = useDeliveryViewModel();
  const selection = useDeliverySelection(photos);
  const [mode, setMode] = useState<DeliveryViewMode>("list");
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  if (!photosAvailable) {
    return <DeliveryExpiredState title={title} />;
  }

  if (photos.length === 0) {
    return <DeliveryEmptyState title={title} />;
  }

  const openGallery = (photoId?: string) => {
    setActiveId(photoId ?? photos[0]?.id);
    setMode("gallery");
  };

  return (
    <div className="relative h-full overflow-hidden">
      {mode === "list" ? (
        <DeliveryList
          onOpenPhoto={openGallery}
          photos={photos}
          selection={selection}
          title={title}
        />
      ) : (
        <DeliveryGallery
          initialPhotoId={activeId ?? photos[0]?.id}
          photos={photos}
          title={title}
          token={token}
        />
      )}

      <DeliveryViewToggle
        mode={mode}
        onToggle={() => (mode === "list" ? openGallery() : setMode("list"))}
      />
    </div>
  );
}
