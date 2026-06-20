import { SuspenseWrapper } from "@roncal/ui";
import { lazy, useState } from "react";

import { DeliveryRowMenu } from "@components/deliveries/delivery-row-menu";

import type { DeliverySummary } from "@lib/deliveries/types";

const DeliveryDetailPanel = lazy(() => import("@components/deliveries/delivery-detail-panel"));

function DetailFallback() {
  return (
    <p className="text-mc-text-secondary m-0 font-mono text-[0.75rem] tracking-[0.08em] uppercase">
      [Cargando…]
    </p>
  );
}

function DetailError() {
  return (
    <p className="text-mc-accent m-0 font-mono text-[0.75rem] tracking-[0.08em] uppercase">
      [Error al cargar el detalle]
    </p>
  );
}

export function DeliveriesResourceList({ deliveries }: { deliveries: DeliverySummary[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <ul className="border-mc-border bg-mc-surface m-0 grid list-none gap-0 overflow-hidden rounded-[0.875rem] border p-0">
      {deliveries.map((delivery) => {
        const expanded = expandedId === delivery.id;

        return (
          <li key={delivery.id} className="border-mc-border border-b last:border-b-0">
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
              <div className="grid min-w-0 gap-1">
                <span className="text-mc-text-display truncate font-semibold">
                  {delivery.clientName}
                </span>
                <span className="text-mc-text-secondary truncate">{delivery.title}</span>
                <span className="text-mc-text-secondary truncate font-mono text-[0.75rem]">
                  {delivery.clientEmail}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <mc-badge tone={delivery.seen ? "success" : "default"}>
                  {delivery.seen ? "Vista" : "No vista"}
                </mc-badge>
                <DeliveryRowMenu
                  deliveryTitle={delivery.title}
                  expanded={expanded}
                  onToggleDetail={() => {
                    setExpandedId((current) => (current === delivery.id ? null : delivery.id));
                  }}
                />
              </div>
            </div>

            {expanded ? (
              <div className="border-mc-border bg-mc-surface-raised border-t px-4 py-4">
                <SuspenseWrapper
                  errorFallback={<DetailError />}
                  fallback={<DetailFallback />}
                  resetKey={delivery.id}
                >
                  <DeliveryDetailPanel deliveryId={delivery.id} photoCount={delivery.photoCount} />
                </SuspenseWrapper>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
