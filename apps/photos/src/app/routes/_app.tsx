import { createFileRoute } from "@tanstack/react-router";

import { CanvasView } from "@/pages/canvas";
import { CanvasLoadingState } from "@/pages/canvas/components/canvas-loading-state";
import { MainLayout } from "@app/layouts/main-layout";
import { trpc } from "@lib/api/client";
import { validatePhotoSearch } from "@utils/validate-photo-search";

// The canvas lives here, not in the child routes, so moving between `/` and `/session/$slug` keeps
// the same wall (camera, shuffle order, shared-element transitions) instead of remounting it.
export const Route = createFileRoute("/_app")({
  // Split together: otherwise the plugin moves MainLayout's import into the component chunk and the
  // inline pending component throws "MainLayout is not defined".
  codeSplitGroupings: [["component", "pendingComponent"]],
  component: () => (
    <MainLayout>
      <CanvasView />
    </MainLayout>
  ),
  pendingComponent: () => (
    <MainLayout>
      <CanvasLoadingState />
    </MainLayout>
  ),
  validateSearch: validatePhotoSearch,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(trpc.sessions.list.queryOptions()),
      context.queryClient.ensureQueryData(trpc.sessions.canvas.queryOptions()),
    ]),
});
