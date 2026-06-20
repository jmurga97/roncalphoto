import { McSearchField } from "@murga.ing/components/react";
import { useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";

import { useDeliveries } from "@app/store/deliveries-store";
import { DeliveriesResourceList } from "@components/deliveries/deliveries-resource-list";
import { EmptyState } from "@components/empty-state";

export function DeliveriesListView() {
  const navigate = useNavigate();
  const deliveries = useDeliveries();
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);
  const filteredDeliveries = deliveries.filter((delivery) => {
    const haystack = [delivery.title, delivery.clientName, delivery.clientEmail]
      .join(" ")
      .toLowerCase();

    return haystack.includes(deferredSearch.toLowerCase());
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div className="admin-kicker">Deliveries</div>
        <h2>Entregas preparadas para tus clientes.</h2>
        <p>
          Consulta el estado de cada entrega y despliega su detalle para revisar las fotos
          incluidas.
        </p>
      </header>

      <section className="admin-table-shell">
        <div className="admin-toolbar">
          <div className="admin-toolbar-controls">
            <McSearchField
              onMcChange={(event) => {
                setSearchValue(event.detail.value);
              }}
              onMcClear={() => {
                setSearchValue("");
              }}
              placeholder="Buscar por cliente, email o título"
              value={searchValue}
            />
            <mc-status-text
              label={`${filteredDeliveries.length} visibles / ${deliveries.length} totales`}
              polite
              tone="idle"
            />
          </div>
          <mc-button
            className="admin-inline-button"
            onClick={() => {
              void navigate({ to: "/deliveries/new" });
            }}
            variant="primary"
          >
            Subir delivery
          </mc-button>
        </div>

        {filteredDeliveries.length > 0 ? (
          <DeliveriesResourceList deliveries={filteredDeliveries} />
        ) : (
          <EmptyState
            action={
              <mc-button
                className="admin-inline-button"
                onClick={() => {
                  void navigate({ to: "/deliveries/new" });
                }}
                variant="primary"
              >
                Subir delivery
              </mc-button>
            }
            description="Prueba con otra búsqueda o crea una nueva entrega."
            title="No hay entregas visibles"
          />
        )}
      </section>
    </div>
  );
}
