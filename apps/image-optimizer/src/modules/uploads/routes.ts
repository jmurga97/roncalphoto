import { getRuntimeEnv } from "@/config/env";
import { BAD_REQUEST } from "@/config/status-codes";
import type { AppBindings } from "@/config/types";
import { HttpError } from "@/shared/errors/http-error";
import { jsonSuccess } from "@/shared/lib/http";
import type { Context } from "hono";
import { Hono } from "hono";
import { requireAdminUploadAuth } from "./auth";
import {
  completeUploadsBodySchema,
  createUploadBodySchema,
  listUploadsQuerySchema,
  uploadIdParamsSchema,
} from "./schemas";
import { createUploadsService } from "./service";

const routes = new Hono<AppBindings>({ strict: false });

async function readJson(c: Context<AppBindings>) {
  try {
    return await c.req.json();
  } catch {
    throw new HttpError(BAD_REQUEST, "Request body must be valid JSON");
  }
}

routes.post("/uploads", async (c) => {
  requireAdminUploadAuth(c);
  const input = createUploadBodySchema.parse(await readJson(c));
  const service = createUploadsService(getRuntimeEnv(c));
  const uploads = await service.createUploads(input);

  return jsonSuccess(c, {
    uploads,
  });
});

routes.post("/uploads/complete", async (c) => {
  requireAdminUploadAuth(c);
  const input = completeUploadsBodySchema.parse(await readJson(c));
  const service = createUploadsService(getRuntimeEnv(c));
  const result = await service.completeUploads(input.uploadIds);

  return jsonSuccess(c, result);
});

routes.get("/uploads", async (c) => {
  requireAdminUploadAuth(c);
  const query = listUploadsQuerySchema.parse(c.req.query());
  const service = createUploadsService(getRuntimeEnv(c));
  const result = await service.listUploads(query.sessionId);

  return jsonSuccess(c, result);
});

routes.post("/uploads/:uploadId/retry", async (c) => {
  requireAdminUploadAuth(c);
  const params = uploadIdParamsSchema.parse(c.req.param());
  const service = createUploadsService(getRuntimeEnv(c));
  const job = await service.retryUpload(params.uploadId);

  return jsonSuccess(c, job);
});

export default routes;
