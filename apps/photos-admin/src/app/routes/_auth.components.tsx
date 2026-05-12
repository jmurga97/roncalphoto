import { createFileRoute } from "@tanstack/react-router";

import { ComponentsShowcaseView } from "@pages/components/components-showcase-view";

export const Route = createFileRoute("/_auth/components")({
  component: ComponentsShowcaseView,
});
