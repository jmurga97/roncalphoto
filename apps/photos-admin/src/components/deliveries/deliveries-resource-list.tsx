import { Badge, InlineMessage, ResourceTable, StatusText } from "@jmurga97/components";
import { SuspenseWrapper } from "@roncal/ui";
import { lazy, useState } from "react";

import { DeliveryRowMenu } from "@components/deliveries/delivery-row-menu";
import { RowControls } from "@components/row-controls";

import type { DeliverySummary } from "@lib/deliveries/types";

const DeliveryDetailPanel = lazy(() => import("@components/deliveries/delivery-detail-panel"));

export function DeliveriesResourceList({
  deliveries,
  refetching = false,
}: {
  deliveries: DeliverySummary[];
  refetching?: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const selected = deliveries.find((delivery) => delivery.id === expandedId);

  return (
    <div className="ming-stack">
      <ResourceTable
        ariaLabel="Entregas"
        rows={deliveries}
        getRowId={(delivery) => delivery.id}
        responsive="stacked"
        refetching={refetching}
        refetchingLabel="Actualizando entregas…"
        emptyState="No hay entregas que coincidan. Prueba con otra búsqueda o crea una entrega."
        columns={[
          { id: "title", header: "Entrega", render: (delivery) => delivery.title },
          {
            id: "seen",
            header: "Estado",
            render: (delivery) => (
              <Badge tone={delivery.seen ? "success" : "neutral"}>{delivery.seen ? "Vista" : "No vista"}</Badge>
            ),
          },
          {
            id: "client",
            header: "Cliente",
            render: (delivery) => (
              <div className="ming-stack ming-stack--tight">
                <span>{delivery.clientName}</span>
                <span className="text-muted-foreground">{delivery.clientEmail}</span>
              </div>
            ),
          },
          {
            id: "photos",
            header: "Fotos",
            align: "end",
            render: (delivery) => new Intl.NumberFormat("es-ES").format(delivery.photoCount),
          },
        ]}
        onRowActivate={(delivery) => setExpandedId((current) => (current === delivery.id ? null : delivery.id))}
        actionsLabel="Acciones"
        renderRowActions={(delivery) => (
          <RowControls>
            <DeliveryRowMenu
              deliveryTitle={delivery.title}
              expanded={expandedId === delivery.id}
              onToggleDetail={() => setExpandedId((current) => (current === delivery.id ? null : delivery.id))}
            />
          </RowControls>
        )}
      />
      {selected ? (
        <section className="ming-section" aria-labelledby="delivery-detail-title">
          <h2 id="delivery-detail-title" className="ming-section__title">
            {selected.title}
          </h2>
          <SuspenseWrapper
            errorFallback={
              <InlineMessage
                tone="error"
                message="No se pudieron cargar las fotos. Cierra el detalle y vuelve a abrirlo."
              />
            }
            fallback={<StatusText label="Cargando fotos…" />}
            resetKey={selected.id}
          >
            <DeliveryDetailPanel deliveryId={selected.id} photoCount={selected.photoCount} />
          </SuspenseWrapper>
        </section>
      ) : null}
    </div>
  );
}
