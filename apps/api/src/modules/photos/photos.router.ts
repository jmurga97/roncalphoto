import { listPhotosInput, updatePhotoInput } from "./photos-input.schema";
import { deletePhoto, getPhoto, listPhotos, updatePhoto } from "./photos.service";
import { idInput } from "../../shared/input.schema";
import { protectedProcedure, publicProcedure, router } from "../../trpc/trpc";

export const photosRouter = router({
  list: publicProcedure.input(listPhotosInput).query(({ ctx, input }) => listPhotos(ctx.db, input)),
  get: publicProcedure.input(idInput).query(({ ctx, input }) => getPhoto(ctx.db, input.id)),
  update: protectedProcedure.input(updatePhotoInput).mutation(({ ctx, input }) => updatePhoto(ctx.db, input)),
  delete: protectedProcedure.input(idInput).mutation(({ ctx, input }) => deletePhoto(ctx.db, input.id)),
});
