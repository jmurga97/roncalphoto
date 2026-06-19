import { createFileRoute } from "@tanstack/react-router";

import { DeliveryView } from "@/pages/delivery";
import { deliveryDetailQueryOptions } from "@lib/api/deliveries/query-options";

export const Route = createFileRoute("/delivery/$token")({
  component: DeliveryView,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(deliveryDetailQueryOptions(params.token)),
});
