import { requireSession } from "@/auth";
import { OK } from "@/config/status-codes";
import { jsonSuccess, protectedValidationNotFoundErrorResponses } from "@/shared/lib/http";
import { createApiRoute, createOpenApiRouter } from "@/shared/lib/openapi";
import {
  sessionResponseSchema,
  sessionSlugParamsSchema,
  updateSessionBodySchema,
} from "../schemas/sessions.schema";
import { getSessionsService } from "../services/sessions.service";

const route = createApiRoute({
  method: "put",
  path: "/{slug}",
  middleware: requireSession,
  tags: ["Sessions"],
  request: {
    params: sessionSlugParamsSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: updateSessionBodySchema,
        },
      },
    },
  },
  errorResponses: protectedValidationNotFoundErrorResponses,
  responses: {
    [OK]: {
      description: "Update a session",
      content: {
        "application/json": {
          schema: sessionResponseSchema,
        },
      },
    },
  },
});

export default createOpenApiRouter(route, async (c) => {
  const { slug } = c.req.valid("param");
  const input = c.req.valid("json");
  const service = getSessionsService(c.env.DB_RONCALPHOTO);
  const session = await service.updateSession(slug, input);

  return jsonSuccess(c, session, OK);
});
