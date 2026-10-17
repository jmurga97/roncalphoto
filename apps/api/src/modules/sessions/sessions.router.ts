import { createSessionInput, updateSessionInput } from "./sessions-input.schema";
import { createSession, deleteSession, getSession, listSessions, updateSession } from "./sessions.service";
import { slugInput } from "../../shared/input.schema";
import { protectedProcedure, publicProcedure, router } from "../../trpc/trpc";

export const sessionsRouter = router({
  list: publicProcedure.query(({ ctx }) => listSessions(ctx.db)),
  get: publicProcedure.input(slugInput).query(({ ctx, input }) => getSession(ctx.db, input.slug)),
  create: protectedProcedure.input(createSessionInput).mutation(({ ctx, input }) => createSession(ctx.db, input)),
  update: protectedProcedure.input(updateSessionInput).mutation(({ ctx, input }) => updateSession(ctx.db, input)),
  delete: protectedProcedure.input(slugInput).mutation(({ ctx, input }) => deleteSession(ctx.db, input.slug)),
});
