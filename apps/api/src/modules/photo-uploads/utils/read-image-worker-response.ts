import { HttpError } from "@/shared/errors";

import { workerErrorResponseSchema } from "../schemas/image-worker.schema";

import type { ZodType } from "zod";

function mapUpstreamStatus(status: number): 400 | 403 | 404 | 409 | 413 | 415 | 502 | 503 {
  switch (status) {
    case 400:
    case 403:
    case 404:
    case 409:
    case 413:
    case 415:
      return status;
    case 503:
      return 503;
    default:
      return 502;
  }
}

export async function readImageWorkerResponse<T>(
  response: Response,
  schema: ZodType<T>,
): Promise<T> {
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsedError = workerErrorResponseSchema.safeParse(body);
    throw new HttpError(
      mapUpstreamStatus(response.status),
      parsedError.success ? parsedError.data.error.message : "Image service request failed",
    );
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    throw new HttpError(502, "Image service returned an invalid response");
  }

  return parsed.data;
}
