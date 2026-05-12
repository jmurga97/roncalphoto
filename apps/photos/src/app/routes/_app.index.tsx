import { createFileRoute } from "@tanstack/react-router";

import { HomeView } from "@/pages/home";

export const Route = createFileRoute("/_app/")({
  component: HomeView,
});
