import { createFileRoute } from "@tanstack/react-router";

import { PhotoUploadView } from "@pages/photos/photo-upload-view";

export const Route = createFileRoute("/_auth/photos/new")({
  component: PhotoUploadView,
});
