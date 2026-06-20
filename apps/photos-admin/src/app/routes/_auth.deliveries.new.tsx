import { createFileRoute } from "@tanstack/react-router";

import { DeliveryUploadView } from "@pages/deliveries/delivery-upload-view";

export const Route = createFileRoute("/_auth/deliveries/new")({
  component: DeliveryUploadView,
});
