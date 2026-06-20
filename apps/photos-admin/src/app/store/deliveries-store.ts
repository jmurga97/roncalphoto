import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import type { DeliverySummary } from "@lib/deliveries/types";

interface DeliveriesStoreState {
  deliveries: DeliverySummary[];
}

interface DeliveriesStoreActions {
  addDelivery: (delivery: DeliverySummary) => void;
}

type DeliveriesStore = DeliveriesStoreState & DeliveriesStoreActions;

const SEED_DELIVERIES: DeliverySummary[] = [
  {
    id: "delivery-boda-laura-mario",
    title: "Boda Laura & Mario",
    clientName: "Laura Vidal",
    clientEmail: "laura.vidal@example.com",
    seen: true,
    photoCount: 8,
  },
  {
    id: "delivery-editorial-otono",
    title: "Editorial otoño",
    clientName: "Marta Ferrer",
    clientEmail: "marta.ferrer@example.com",
    seen: false,
    photoCount: 12,
  },
  {
    id: "delivery-retrato-corporativo",
    title: "Retrato corporativo Nexa",
    clientName: "Nexa Studios",
    clientEmail: "hola@nexastudios.example",
    seen: false,
    photoCount: 5,
  },
  {
    id: "delivery-bautizo-olivia",
    title: "Bautizo de Olivia",
    clientName: "Carlos Pérez",
    clientEmail: "carlos.perez@example.com",
    seen: true,
    photoCount: 6,
  },
];

const useDeliveriesStore = create<DeliveriesStore>()((set) => ({
  deliveries: SEED_DELIVERIES,
  addDelivery: (delivery) => {
    set((state) => ({ deliveries: [delivery, ...state.deliveries] }));
  },
}));

export function useDeliveries() {
  return useDeliveriesStore((state) => state.deliveries);
}

export function useDeliveriesActions() {
  return useDeliveriesStore(
    useShallow((state) => ({
      addDelivery: state.addDelivery,
    })),
  );
}
