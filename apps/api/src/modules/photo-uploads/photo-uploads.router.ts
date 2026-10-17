import { createPhotoUploadInput, uploadIdInput } from "./photo-uploads-input.schema";
import { createPhotoUpload, getPhotoUpload, retryPhotoUpload } from "./photo-uploads.service";
import { protectedProcedure, router } from "../../trpc/trpc";

// 1. create: reserve the photo id and get a signed PUT URL from ming-image-worker.
// 2. the browser PUTs the original to R2; the worker builds the `main` and `thumbnail` variants.
// 3. get: poll until `succeeded`; the first successful poll creates the `photos` row.
export const photoUploadsRouter = router({
  create: protectedProcedure
    .input(createPhotoUploadInput)
    .mutation(({ ctx, input }) => createPhotoUpload(ctx.db, ctx.env.IMAGE_WORKER, input)),
  get: protectedProcedure
    .input(uploadIdInput)
    .query(({ ctx, input }) => getPhotoUpload(ctx.db, ctx.env.IMAGE_WORKER, input.uploadId)),
  retry: protectedProcedure
    .input(uploadIdInput)
    .mutation(({ ctx, input }) => retryPhotoUpload(ctx.db, ctx.env.IMAGE_WORKER, input.uploadId)),
});
