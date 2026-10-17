import { createFileRoute } from "@tanstack/react-router";

import { DeliveryView } from "@/pages/delivery";
import { trpc } from "@lib/api/client";

export const Route = createFileRoute("/delivery/$token")({
  component: DeliveryView,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(trpc.clientDeliveries.get.queryOptions({ token: params.token })),
});
