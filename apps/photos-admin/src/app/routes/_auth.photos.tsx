import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { trpc } from "@lib/api/client";
import { PhotosListView } from "@pages/photos/photos-list-view";

export const Route = createFileRoute("/_auth/photos")({
  component: PhotosRoute,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(trpc.photos.list.queryOptions()),
      context.queryClient.ensureQueryData(trpc.sessions.list.queryOptions()),
    ]),
});

function PhotosRoute() {
  const { pathname } = useLocation();

  return pathname === "/photos" ? <PhotosListView /> : <Outlet />;
}
