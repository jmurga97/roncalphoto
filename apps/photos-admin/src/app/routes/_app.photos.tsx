import { photosListQueryOptions } from "@lib/api/photos/query-options";
import { PhotosListView } from "@pages/photos/photos-list-view";
import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router";

function validatePhotosSearch(search: Record<string, unknown>) {
  const page =
    typeof search.page === "number"
      ? search.page
      : typeof search.page === "string"
        ? Number.parseInt(search.page, 10)
        : 1;

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export const Route = createFileRoute("/_app/photos")({
  component: PhotosRoute,
  validateSearch: validatePhotosSearch,
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(photosListQueryOptions(deps.page, 24)),
});

function PhotosRoute() {
  const location = useLocation();

  return location.pathname === "/photos" ? <PhotosListView /> : <Outlet />;
}
