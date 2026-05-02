import { OK } from "@/config/status-codes";
import type { AppBindings } from "@/config/types";
import type { Context } from "hono";

export function jsonSuccess<Data>(c: Context<AppBindings>, data: Data) {
  return c.json(
    {
      success: true as const,
      data,
    },
    OK,
  );
}
