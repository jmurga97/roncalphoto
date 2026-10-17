import { getTag, listTags } from "./tags.service";
import { slugInput } from "../../shared/input.schema";
import { publicProcedure, router } from "../../trpc/trpc";

export const tagsRouter = router({
  list: publicProcedure.query(({ ctx }) => listTags(ctx.db)),
  get: publicProcedure.input(slugInput).query(({ ctx, input }) => getTag(ctx.db, input.slug)),
});
