import { UNAUTHORIZED } from "@/config/status-codes";
import type { AppBindings } from "@/config/types";
import { HttpError } from "@/shared/errors/http-error";
import type { Context } from "hono";

function readBearerToken(headerValue: string | undefined): string | undefined {
  if (!headerValue) {
    return undefined;
  }

  const [scheme, token] = headerValue.split(/\s+/, 2);
  return scheme?.toLowerCase() === "bearer" ? token : undefined;
}

export function requireAdminUploadAuth(c: Context<AppBindings>) {
  const token = readBearerToken(c.req.header("Authorization"));
  const expectedToken = c.get("runtimeEnv").ADMIN_UPLOAD_TOKEN;

  if (!token || token !== expectedToken) {
    throw new HttpError(UNAUTHORIZED, "Unauthorized");
  }
}
