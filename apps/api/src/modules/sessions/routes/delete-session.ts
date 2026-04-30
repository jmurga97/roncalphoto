import { OK } from "@/config/status-codes";
import {
  jsonSuccess,
  protectedRouteNotFoundErrorResponses,
} from "@/shared/lib/http";
import { createOpenApiRouter, createProtectedRoute } from "@/shared/lib/openapi";
import { deleteSessionResponseSchema, sessionSlugParamsSchema } from "../schemas/sessions.schema";
import { getSessionsService } from "../services/sessions.service";

const route = createProtectedRoute({
  method: "delete",
  path: "/{slug}",
  tags: ["Sessions"],
  request: {
    params: sessionSlugParamsSchema,
  },
  errorResponses: protectedRouteNotFoundErrorResponses,
  responses: {
    [OK]: {
      description: "Delete a session",
      content: {
        "application/json": {
          schema: deleteSessionResponseSchema,
        },
      },
    },
  },
});

export default createOpenApiRouter(route, async (c) => {
  const { slug } = c.req.valid("param");
  const service = getSessionsService(c.env.DB_RONCALPHOTO);
  const result = await service.deleteSession(slug);

  return jsonSuccess(c, result, OK);
});
