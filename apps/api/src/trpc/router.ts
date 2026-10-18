import { router } from "./trpc";
import { clientDeliveriesRouter } from "../modules/client-deliveries/client-deliveries.router";
import { photoUploadsRouter } from "../modules/photo-uploads/photo-uploads.router";
import { photosRouter } from "../modules/photos/photos.router";
import { sessionsRouter } from "../modules/sessions/sessions.router";
import { tagsRouter } from "../modules/tags/tags.router";

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export const appRouter = router({
  sessions: sessionsRouter,
  photos: photosRouter,
  tags: tagsRouter,
  photoUploads: photoUploadsRouter,
  clientDeliveries: clientDeliveriesRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type Session = RouterOutputs["sessions"]["get"];
export type SessionSummary = RouterOutputs["sessions"]["list"][number];
export type Photo = RouterOutputs["photos"]["get"];
export type PhotoMetadata = Photo["metadata"];
export type Tag = RouterOutputs["tags"]["list"][number];
