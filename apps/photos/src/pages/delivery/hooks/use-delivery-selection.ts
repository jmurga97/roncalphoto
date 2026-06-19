import { useCallback, useMemo, useState } from "react";

import type { DeliveryPhotoViewModel } from "../types";

export interface DeliverySelection {
  selectedIds: string[];
  selectedCount: number;
  allSelected: boolean;
  isSelected: (photoId: string) => boolean;
  toggle: (photoId: string) => void;
  toggleAll: () => void;
}

export function useDeliverySelection(photos: DeliveryPhotoViewModel[]): DeliverySelection {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const toggle = useCallback((photoId: string) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  }, []);

  const allSelected = photos.length > 0 && selected.size === photos.length;

  const toggleAll = useCallback(() => {
    setSelected((previous) =>
      previous.size === photos.length ? new Set() : new Set(photos.map((photo) => photo.id)),
    );
  }, [photos]);

  const isSelected = useCallback((photoId: string) => selected.has(photoId), [selected]);

  const selectedIds = useMemo(
    () => photos.filter((photo) => selected.has(photo.id)).map((photo) => photo.id),
    [photos, selected],
  );

  return {
    selectedIds,
    selectedCount: selectedIds.length,
    allSelected,
    isSelected,
    toggle,
    toggleAll,
  };
}
