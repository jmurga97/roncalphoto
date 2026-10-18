import { createBrowserHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { CanvasLoadingState } from "@/pages/canvas/components/canvas-loading-state";
import { AppProviders } from "@app/providers";
import { routeTree } from "@app/route-tree.gen";
import { RouteErrorState } from "@components/error/error-state";
import { queryClient } from "@lib/query-client";
import "./styles/global.css";

const router = createRouter({
  routeTree,
  history: createBrowserHistory(),
  context: {
    queryClient,
  },
  defaultErrorComponent: RouteErrorState,
  defaultPendingComponent: CanvasLoadingState,
  defaultPendingMinMs: 250,
  defaultPendingMs: 120,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const container = document.querySelector("#root");

if (!container) {
  throw new Error("Unable to find root element");
}

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
