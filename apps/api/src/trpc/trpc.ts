import { initTRPC, TRPCError } from "@trpc/server";

import { toRpcError } from "../shared/errors";

import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create();

export const router = t.router;

// Unexpected failures (mostly D1 constraint violations) become typed client errors.
export const publicProcedure = t.procedure.use(async ({ next }) => {
  const result = await next();

  if (!result.ok && result.error.code === "INTERNAL_SERVER_ERROR") {
    throw toRpcError(result.error.cause ?? result.error);
  }

  return result;
});

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const session = await ctx.getSession();

  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { session } });
});
