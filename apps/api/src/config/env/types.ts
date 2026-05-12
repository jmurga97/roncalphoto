import type { authEnvSchema, EmailWorkerServiceBinding, publicEnvSchema } from "./schema";
import type { z } from "zod";

export type ParsedPublicEnv = z.output<typeof publicEnvSchema>;
export type ParsedAuthEnv = z.output<typeof authEnvSchema>;

export interface RuntimeEnv extends ParsedPublicEnv {
  allowedOrigins: string[];
}

export interface AuthRuntimeEnv extends Omit<ParsedAuthEnv, "EMAIL_WORKER"> {
  EMAIL_WORKER: EmailWorkerServiceBinding;
}
