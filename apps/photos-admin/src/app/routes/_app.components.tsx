import { ComponentsShowcaseView } from "@pages/components/components-showcase-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/components")({
  component: ComponentsShowcaseView,
});
