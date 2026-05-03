import { defineConfig } from "drizzle-kit";

function getRequiredEnv(name: string): string {
  return process.env[name] ?? "";
}

export default defineConfig({
  schema: ["./src/db/schema/index.ts", "./src/db/schema/auth.ts"],
  out: "./src/db/migrations",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: getRequiredEnv("CLOUDFLARE_ACCOUNT_ID"),
    databaseId: getRequiredEnv("CLOUDFLARE_DATABASE_ID"),
    token: getRequiredEnv("CLOUDFLARE_D1_TOKEN"),
  },
  verbose: true,
  strict: true,
});
