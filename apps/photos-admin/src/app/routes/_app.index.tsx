import { OverviewView } from "@pages/overview/overview-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
  component: OverviewView,
});
