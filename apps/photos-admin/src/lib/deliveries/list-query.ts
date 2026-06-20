import { queryOptions } from "@tanstack/react-query";

import type { DeliverySummary } from "@lib/deliveries/types";

// MOCK: datos de ejemplo en memoria mientras no existe el endpoint de deliveries.
// Eliminar este array cuando se implemente la llamada real al backend
// (GET /api/deliveries).
const MOCK_DELIVERIES: DeliverySummary[] = [
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

// MOCK: simula la respuesta del backend. Reemplazar el cuerpo por la llamada real
// (fetch al endpoint de deliveries) y eliminar los datos mock de arriba.
function fetchDeliveries(): Promise<DeliverySummary[]> {
  return Promise.resolve(MOCK_DELIVERIES);
}

export function deliveriesListQueryOptions() {
  return queryOptions({
    queryKey: ["deliveries", "list"] as const,
    queryFn: fetchDeliveries,
  });
}
