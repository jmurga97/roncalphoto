import axe from "axe-core";

import { expect, test } from "./fixtures";

const screens = [
  ["/", "Resumen"],
  ["/sessions", "Sesiones"],
  ["/sessions/new", "Nueva sesión"],
  ["/sessions/editorial-atardecer", "Editorial al atardecer"],
  ["/photos", "Fotos"],
  ["/photos/new", "Subir fotos"],
  ["/photos/photo-one", "Retrato editorial"],
  ["/tags", "Etiquetas"],
  ["/tags/portrait", "Portrait"],
  ["/deliveries", "Entregas"],
  ["/deliveries/new", "Nueva entrega"],
] as const;

declare global {
  interface Window {
    axe: typeof axe;
  }
}

for (const theme of ["light", "dark"] as const) {
  for (const width of [375, 768, 1280]) {
    test(`Ming ${theme} a ${width}px: rutas, accesibilidad y layout`, async ({ adminPage }, testInfo) => {
      test.setTimeout(90_000);
      await adminPage.setViewportSize({ width, height: 900 });
      await adminPage.addInitScript((savedTheme) => localStorage.setItem("roncalphoto-admin-theme", savedTheme), theme);
      const errors: string[] = [];
      adminPage.on("pageerror", (error) => errors.push(error.message));
      for (const [path, title] of screens) {
        await adminPage.goto(path);
        await expect(adminPage.locator("h1")).toHaveText(title);
        await expect(adminPage.locator("h1")).toHaveCount(1);
        await expect(adminPage.locator("main")).toHaveCount(1);
        await expect(adminPage.locator("html")).toHaveClass(theme);
        await adminPage.evaluate(() => document.fonts.ready);
        const overflow = await adminPage.evaluate(() => {
          const slot = document.querySelector(".admin-main-slot");
          return {
            page: document.documentElement.scrollWidth > innerWidth,
            main: slot ? slot.scrollWidth > slot.clientWidth + 1 : false,
          };
        });
        expect(overflow, `${path} overflow`).toEqual({ page: false, main: false });
        await adminPage.evaluate(axe.source);
        const violations = await adminPage.evaluate(async () =>
          (
            await window.axe.run(document, {
              runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
            })
          ).violations.map((issue) => ({
            id: issue.id,
            nodes: issue.nodes.map((node) => node.target),
          })),
        );
        expect(violations, `${path} accessibility`).toEqual([]);
        await adminPage.screenshot({
          path: testInfo.outputPath(`${path.replaceAll("/", "_") || "overview"}.png`),
        });
      }
      expect(errors).toEqual([]);
    });
  }
}

test("login: formulario accesible y código de seis dígitos", async ({ adminPage }, testInfo) => {
  await adminPage.route("**/api/auth/get-session", (route) =>
    route.fulfill({ contentType: "application/json", body: "null" }),
  );
  await adminPage.route("**/api/auth/email-otp/send-verification-otp", (route) =>
    route.fulfill({ contentType: "application/json", body: '{"success":true}' }),
  );
  await adminPage.goto("/login");
  await adminPage.getByRole("textbox", { name: "Email" }).fill("editor@example.com");
  await adminPage.getByRole("button", { name: "Solicitar código" }).click();
  await expect(adminPage.getByRole("textbox", { name: "Código de acceso" })).toBeFocused();
  await expect(adminPage.getByRole("textbox", { name: "Código de acceso" })).toHaveAttribute("minlength", "6");
  await adminPage.evaluate(axe.source);
  const violations = await adminPage.evaluate(async () =>
    (await window.axe.run(document)).violations.map((issue) => issue.id),
  );
  expect(violations).toEqual([]);
  await adminPage.screenshot({ path: testInfo.outputPath("login.png") });
});
