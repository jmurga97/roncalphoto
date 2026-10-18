import { queryOptions } from "@tanstack/react-query";

import { dataMode } from "@lib/api/client";

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

// Dev-only worst case for the data toggle (`?data=worst`): same shape as the mock above.
const WORST_DELIVERIES: DeliverySummary[] = [
  {
    id: "delivery-worst-long",
    title: "Boda de Íñigo Ibáñez y Begoña Muñoz-Echeverría · Ceremonia, cóctel y banquete en el Palacio de Ezpeleta",
    clientName: "Aleksandra Wiśniewska-Kowalczyk",
    clientEmail: "bartholomew.fitzgerald@northwind-industries-holdings.example.com",
    seen: false,
    photoCount: 1240,
  },
  { id: "delivery-worst-jo", title: "Jo", clientName: "Jo", clientEmail: "jo@x.es", seen: true, photoCount: 1 },
  {
    id: "delivery-worst-zero",
    title: "Catálogo_Primavera-Verano_2026_ReferenciasFinales_v3",
    clientName: "東京フォト株式会社",
    clientEmail: "info@tokyo-photo.co.jp",
    seen: false,
    photoCount: 0,
  },
  {
    id: "delivery-worst-rtl",
    title: "Marrakech · ليالي مراكش 🌙",
    clientName: "يوسف بن عبد الرحمن",
    clientEmail: "youssef@example.ma",
    seen: true,
    photoCount: 37,
  },
];

function devDeliveries(): DeliverySummary[] {
  switch (dataMode) {
    case "worst":
      return WORST_DELIVERIES;
    case "empty":
      return [];
    case "one":
      return MOCK_DELIVERIES.slice(0, 1).map((delivery) => ({ ...delivery, photoCount: 1 }));
    case "huge":
      return Array.from({ length: 1000 }, (_, index) => ({ ...MOCK_DELIVERIES[index % 4], id: `delivery-${index}` }));
    case "demo":
      return MOCK_DELIVERIES;
  }
}

// MOCK: simula la respuesta del backend. Reemplazar el cuerpo por la llamada real
// (fetch al endpoint de deliveries) y eliminar los datos mock de arriba.
function fetchDeliveries(): Promise<DeliverySummary[]> {
  return Promise.resolve(import.meta.env.DEV ? devDeliveries() : MOCK_DELIVERIES);
}

export function deliveriesListQueryOptions() {
  return queryOptions({
    queryKey: ["deliveries", "list"] as const,
    queryFn: fetchDeliveries,
  });
}
