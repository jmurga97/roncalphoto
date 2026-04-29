import { HomeView } from "@/pages/home";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
  component: HomeView,
});
