import { createFileRoute, redirect } from "@tanstack/react-router";
import { preload } from "react-dom";

import { trpc } from "@lib/api/client";

// Rendered by the `/_app` layout with the stage open on this session (`?photo=` or its first photo).
export const Route = createFileRoute("/_app/session/$slug")({
  loaderDeps: ({ search }) => ({ photo: search.photo }),
  loader: async ({ context, deps, params }) => {
    const sessions = await context.queryClient.ensureQueryData(trpc.sessions.canvas.queryOptions());
    const photos = sessions.find((session) => session.slug === params.slug)?.photos ?? [];
    const photo = photos.find((sessionPhoto) => sessionPhoto.id === deps.photo) ?? photos[0];

    // An unknown or empty session just lands on the canvas.
    if (!photo) {
      redirect({ replace: true, search: { photo: undefined, tag: undefined }, throw: true, to: "/" });
    }

    preload(photo.url, { as: "image", fetchPriority: "high" });
  },
});
