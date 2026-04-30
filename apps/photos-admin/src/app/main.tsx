import { AppProviders } from "@app/providers";
import { routeTree } from "@app/route-tree.gen";
import { RouteErrorState } from "@components/error/error-state";
import { LoadingState } from "@components/loading/loading-state";
import { queryClient } from "@lib/query-client";
import { registerMurgaComponents } from "@murga/components/react";
import { RouterProvider, createBrowserHistory, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";

registerMurgaComponents();

const router = createRouter({
  routeTree,
  history: createBrowserHistory(),
  context: {
    queryClient,
  },
  defaultErrorComponent: RouteErrorState,
  defaultPendingComponent: () => <LoadingState />,
  defaultPendingMinMs: 200,
  defaultPendingMs: 120,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const container = document.getElementById("root");

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
