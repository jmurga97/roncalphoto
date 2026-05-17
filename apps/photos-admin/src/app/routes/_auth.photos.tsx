import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { photosListQueryOptions } from "@lib/api/photos/query-options";
import { PhotosListView } from "@pages/photos/photos-list-view";

export const Route = createFileRoute("/_auth/photos")({
  component: PhotosRoute,
  loader: ({ context }) => context.queryClient.ensureQueryData(photosListQueryOptions()),
});

function PhotosRoute() {
  const location = useLocation();

  return location.pathname === "/photos" ? <PhotosListView /> : <Outlet />;
}
