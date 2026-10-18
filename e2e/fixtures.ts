import { test as base } from "@playwright/test";

import type { Page, Route } from "@playwright/test";

const tag = { id: "tag-portrait", name: "Portrait", slug: "portrait" };
const photo = {
  id: "photo-one",
  sessionId: "session-one",
  url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23525a66'/%3E%3C/svg%3E",
  miniature:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='120'%3E%3Crect width='100%25' height='100%25' fill='%23525a66'/%3E%3C/svg%3E",
  alt: "Retrato editorial",
  about: "Retrato de prueba determinista",
  sortOrder: 1,
  metadata: {
    iso: 400,
    aperture: "f/2.8",
    shutterSpeed: "1/250",
    lens: "85mm",
    camera: "Test camera",
  },
};
const session = {
  id: "session-one",
  slug: "editorial-atardecer",
  title: "Editorial al atardecer",
  description: "Sesión de prueba determinista",
  createdAt: "2026-01-15T12:00:00.000Z",
  tags: [tag],
  photos: [photo],
};

type Procedure = (input: { data?: object } | undefined) => unknown;
export type Procedures = Map<string, Procedure>;

/** tRPC procedure path -> fake resolver. Tests can override entries per test. */
function defaultProcedures(): Procedures {
  return new Map<string, Procedure>([
    [
      "sessions.list",
      () => {
        const { photos, ...summary } = session;

        return [{ ...summary, firstPhotoId: photos[0]?.id, photoCount: photos.length }];
      },
    ],
    ["sessions.get", () => session],
    ["sessions.update", (input) => ({ ...session, ...input?.data })],
    ["photos.list", () => ({ items: [photo], total: 1 })],
    ["photos.get", () => photo],
    ["photos.update", (input) => ({ ...photo, ...input?.data })],
    ["photos.delete", () => ({ id: photo.id })],
    ["tags.list", () => [tag]],
    ["tags.get", () => ({ tag, sessions: [session] })],
  ]);
}

// httpBatchLink: `/trpc/a,b?batch=1&input={"0":…,"1":…}` (GET) or the same map as POST body.
function readBatchInputs(route: Route): Record<string, unknown> {
  const request = route.request();
  const raw = request.method() === "GET" ? new URL(request.url()).searchParams.get("input") : request.postData();

  return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
}

async function answerTrpc(route: Route, procedures: Procedures): Promise<void> {
  const paths = new URL(route.request().url()).pathname.replace(/^\/trpc\//, "").split(",");
  const inputs = readBatchInputs(route);
  const results = paths.map((path, index) => {
    try {
      const resolve = procedures.get(path);

      if (!resolve) {
        throw new Error(`Unhandled fixture: ${path}`);
      }

      return { result: { data: resolve(inputs[index] as Parameters<Procedure>[0]) } };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : String(error),
          code: -32603,
          data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500, path },
        },
      };
    }
  });

  await route.fulfill({
    status: results.some((item) => "error" in item) ? 500 : 200,
    contentType: "application/json",
    body: JSON.stringify(results),
  });
}

async function installApiFixtures(page: Page, procedures: Procedures): Promise<void> {
  await page.route("**/api/auth/get-session", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        session: { id: "e2e-session", userId: "e2e-user" },
        user: { id: "e2e-user", email: "e2e@roncalphoto.test", name: "E2E" },
      }),
    }),
  );
  await page.route("**/trpc/**", (route) => answerTrpc(route, procedures));
}

export const test = base.extend<{ adminPage: Page; procedures: Procedures }>({
  // oxlint-disable-next-line no-empty-pattern -- Playwright requires the destructuring pattern.
  procedures: async ({}, use) => {
    await use(defaultProcedures());
  },
  adminPage: async ({ page, procedures }, use) => {
    await installApiFixtures(page, procedures);
    await use(page);
  },
});

export { expect } from "@playwright/test";
