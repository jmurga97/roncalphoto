#!/usr/bin/env bun
/**
 * Seed script for D1 database.
 *
 * Usage:
 *   bun run scripts/seed.ts           # seeds local D1
 *   bun run scripts/seed.ts --remote  # seeds remote D1
 */

import { $ } from "bun";

const isRemote = process.argv.includes("--remote");
const target = isRemote ? "remote" : "local";
const flag = isRemote ? "--remote" : "--local";
const dbName = "DB_RONCALPHOTO";
const seedFile = "scripts/seed-data.sql";

console.log(`🌱 Seeding ${target} database...`);

try {
  await $`wrangler d1 execute ${dbName} ${flag} --file=${seedFile}`;
  console.log(`✅ Seed applied to ${target} database.`);
} catch (error) {
  console.error(`❌ Failed to seed ${target} database.`);
  console.error(error);
  process.exit(1);
}
