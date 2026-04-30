import { CREATED } from "@/config/status-codes";
import { jsonSuccess } from "@/shared/lib/http";
import { createApiRoute, createOpenApiRouter } from "@/shared/lib/openapi";
import { createSessionBodySchema, sessionResponseSchema } from "../schemas/sessions.schema";
import { getSessionsService } from "../services/sessions.service";

const route = createApiRoute({
  method: "post",
  path: "/",
  tags: ["Sessions"],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: createSessionBodySchema,
        },
      },
    },
  },
  responses: {
    [CREATED]: {
      description: "Create a session",
      content: {
        "application/json": {
          schema: sessionResponseSchema,
        },
      },
    },
  },
});

export default createOpenApiRouter(route, async (c) => {
  const input = c.req.valid("json");
  const service = getSessionsService(c.env.DB_RONCALPHOTO);
  const session = await service.createSession(input);

  return jsonSuccess(c, session, CREATED);
});
