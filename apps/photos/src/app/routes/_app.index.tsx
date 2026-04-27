import { HomeView } from "@/pages/home/home-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
  component: HomeView,
});
