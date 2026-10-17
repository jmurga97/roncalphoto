import { z } from "zod";

import { getDelivery } from "./client-deliveries.service";
import { publicProcedure, router } from "../../trpc/trpc";

const tokenInput = z.object({ token: z.string().trim().min(1) });

// Public by design: the unguessable token in the link is the credential.
export const clientDeliveriesRouter = router({
  get: publicProcedure.input(tokenInput).query(({ ctx, input }) => getDelivery(ctx.db, input.token)),
});
