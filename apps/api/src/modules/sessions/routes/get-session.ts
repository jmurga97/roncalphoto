import { OK } from "@/config/status-codes";
import { jsonSuccess, validationNotFoundErrorResponses } from "@/shared/lib/http";
import { createApiRoute, createOpenApiRouter } from "@/shared/lib/openapi";
import { sessionResponseSchema, sessionSlugParamsSchema } from "../schemas/sessions.schema";
import { getSessionsService } from "../services/sessions.service";

const route = createApiRoute({
  method: "get",
  path: "/{slug}",
  tags: ["Sessions"],
  request: {
    params: sessionSlugParamsSchema,
  },
  errorResponses: validationNotFoundErrorResponses,
  responses: {
    [OK]: {
      description: "Get session detail",
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
  const service = getSessionsService(c.env.DB_RONCALPHOTO);
  const session = await service.getSessionBySlug(slug, {
    includePhotos: true,
  });

  return jsonSuccess(c, session, OK);
});
