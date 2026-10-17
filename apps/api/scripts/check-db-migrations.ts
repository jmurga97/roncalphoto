import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const apiDirectory = resolve(import.meta.dir, "..");
const temporaryDirectory = await mkdtemp(join(tmpdir(), "roncalphoto-drizzle-"));
const journalPath = join(temporaryDirectory, "meta", "_journal.json");

async function readJournalSize() {
  const journal = JSON.parse(await readFile(journalPath, "utf8")) as { entries: unknown[] };
  return journal.entries.length;
}

try {
  await cp(join(apiDirectory, "migrations", "meta"), join(temporaryDirectory, "meta"), {
    recursive: true,
  });
  const before = await readJournalSize();
  const child = Bun.spawn(
    [
      "bunx",
      "drizzle-kit",
      "generate",
      "--dialect",
      "sqlite",
      "--schema",
      "../../packages/db/src/schema/index.ts",
      "--out",
      temporaryDirectory,
      "--name",
      "schema_check",
    ],
    { cwd: apiDirectory, stdin: "ignore", stdout: "pipe", stderr: "pipe" },
  );
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  if (code !== 0) throw new Error(stderr || stdout || "Drizzle schema check failed");
  if ((await readJournalSize()) !== before) {
    throw new Error(
      "Schema differs from the committed migrations. Run bun run db:generate -- --name <change> and commit the generated SQL and metadata together.",
    );
  }
  console.log("Drizzle schema matches the committed migration snapshot.");
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
