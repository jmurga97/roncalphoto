import { Button, InlineMessage, SearchField } from "@jmurga97/components";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";

import { DeliveriesResourceList } from "@components/deliveries/deliveries-resource-list";
import { PageHeader } from "@components/page-header";
import { deliveriesListQueryOptions } from "@lib/deliveries/list-query";

export function DeliveriesListView() {
  const { data: deliveries, isFetching } = useSuspenseQuery(deliveriesListQueryOptions());
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue).toLowerCase();
  const filteredDeliveries = deliveries.filter((delivery) =>
    [delivery.title, delivery.clientName, delivery.clientEmail].join(" ").toLowerCase().includes(deferredSearch),
  );

  return (
    <div className="ming-page">
      <PageHeader
        title="Entregas"
        description="Consulta las entregas y revisa sus imágenes."
        actions={
          <Button nativeButton={false} render={<Link to="/deliveries/new" />}>
            Crear entrega
          </Button>
        }
      />
      <section className="admin-table-shell">
        <InlineMessage
          title="Vista de prueba"
          message="Las entregas utilizan datos de ejemplo. Los borradores todavía no se guardan ni se envían al cliente."
        />
        <div className="ming-toolbar">
          <SearchField
            className="ming-toolbar__search"
            aria-label="Buscar entregas"
            clearLabel="Borrar búsqueda"
            onValueChange={setSearchValue}
            placeholder="Buscar por cliente, email o título"
            value={searchValue}
          />
          <span className="ming-toolbar__end ming-data">
            {filteredDeliveries.length} {filteredDeliveries.length === 1 ? "entrega" : "entregas"}
          </span>
        </div>
        <DeliveriesResourceList deliveries={filteredDeliveries} refetching={isFetching} />
      </section>
    </div>
  );
}
