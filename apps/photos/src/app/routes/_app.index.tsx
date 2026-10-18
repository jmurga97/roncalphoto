import { createFileRoute } from "@tanstack/react-router";
import { preload } from "react-dom";

import { trpc } from "@lib/api/client";

// Rendered by the `/_app` layout; this route only preloads a photo opened from an old `/?photo=` link.
export const Route = createFileRoute("/_app/")({
  loaderDeps: ({ search }) => ({ photo: search.photo }),
  loader: async ({ context, deps }) => {
    const sessions = await context.queryClient.ensureQueryData(trpc.sessions.canvas.queryOptions());
    const photo = sessions.flatMap((session) => session.photos).find((photo) => photo.id === deps.photo);

    if (photo) {
      preload(photo.url, { as: "image", fetchPriority: "high" });
    }
  },
});
