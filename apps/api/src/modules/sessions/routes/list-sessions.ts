import { OK } from "@/config/status-codes";
import { jsonSuccess } from "@/shared/lib/http";
import { createOpenApiRouter, createProtectedRoute } from "@/shared/lib/openapi";
import { listSessionsQuerySchema, sessionsResponseSchema } from "../schemas/sessions.schema";
import { getSessionsService } from "../services/sessions.service";

function includesPhotos(include?: string): boolean {
  if (!include) {
    return false;
  }

  return include
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .includes("photos");
}

const route = createProtectedRoute({
  method: "get",
  path: "/",
  tags: ["Sessions"],
  request: {
    query: listSessionsQuerySchema,
  },
  responses: {
    [OK]: {
      description: "List sessions",
      content: {
        "application/json": {
          schema: sessionsResponseSchema,
        },
      },
    },
  },
});

export default createOpenApiRouter(route, async (c) => {
  const query = c.req.valid("query");
  const service = getSessionsService(c.env.DB_RONCALPHOTO);
  const sessions = await service.listSessions({
    includePhotos: includesPhotos(query.include),
  });

  return jsonSuccess(c, sessions, OK);
});
