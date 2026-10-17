import { expect, test } from "./fixtures";

test.beforeEach(async ({ adminPage }) => {
  await adminPage.goto("/");
});

test("smoke de las áreas principales", async ({ adminPage }) => {
  await expect(adminPage.getByRole("heading", { name: "Resumen" })).toBeVisible();
  for (const [name, heading] of [
    ["Sesiones", "Sesiones"],
    ["Fotos", "Fotos"],
    ["Etiquetas", "Etiquetas"],
    ["Entregas", "Entregas"],
  ] as const) {
    await adminPage
      .getByRole("link", { name: new RegExp(name), exact: true })
      .first()
      .click();
    await expect(adminPage.getByRole("heading", { name: heading }).first()).toBeVisible();
  }
});

test("edita una sesión y guarda el formulario", async ({ adminPage }) => {
  await adminPage.goto("/sessions/editorial-atardecer");
  const title = adminPage.getByRole("textbox", { name: /Título/ });
  await title.fill("Editorial nocturna");
  await adminPage.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(title).toHaveValue("Editorial nocturna");
});

test("selecciona una foto y confirma la acción destructiva", async ({ adminPage }) => {
  await adminPage.goto("/photos");
  await adminPage.getByRole("checkbox", { name: "Seleccionar Retrato editorial" }).check();
  await adminPage.getByRole("button", { name: "Eliminar" }).click();
  const dialog = adminPage.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Cancelar" })).toBeFocused();
  await dialog.getByRole("button", { name: "Cancelar" }).click();
  await expect(dialog).toBeHidden();
});

test("opera el menú de delivery por teclado y restaura el foco", async ({ adminPage }) => {
  await adminPage.goto("/deliveries");
  const trigger = adminPage.getByRole("button", { name: "Acciones para Boda Laura & Mario" });
  await trigger.focus();
  await adminPage.keyboard.press("ArrowDown");
  const item = adminPage.getByRole("menuitem", { name: "Más detalle" });
  await expect(item).toBeFocused();
  await adminPage.keyboard.press("Enter");
  await expect(trigger).toBeFocused();
  await expect(adminPage.getByRole("menu")).toBeHidden();

  await adminPage.keyboard.press("Enter");
  await expect(adminPage.getByRole("menuitem", { name: "Ocultar detalle" })).toBeFocused();
  await adminPage.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("navegación responsive básica", async ({ adminPage }) => {
  await adminPage.setViewportSize({ width: 390, height: 844 });
  await adminPage.reload();
  const toggle = adminPage.getByRole("button", { name: /navegación/i }).first();
  await toggle.click();
  await expect(adminPage.getByRole("dialog")).toBeVisible();
  await adminPage.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
});

test("el preview por teclado no activa la fila y restaura el foco", async ({ adminPage }) => {
  await adminPage.goto("/photos");
  const preview = adminPage.getByRole("button", { name: "Previsualizar Retrato editorial" });
  await preview.focus();
  await adminPage.keyboard.press("Enter");
  await expect(adminPage.getByRole("dialog")).toBeVisible();
  await expect(adminPage).toHaveURL(/\/photos$/);
  await adminPage.keyboard.press("Escape");
  await expect(preview).toBeFocused();
});

test("la validación enfoca el primer campo inválido", async ({ adminPage }) => {
  await adminPage.goto("/sessions/editorial-atardecer");
  await adminPage.getByRole("textbox", { name: /Título/ }).fill("");
  await adminPage.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(adminPage.getByRole("textbox", { name: /Título/ })).toBeFocused();
  await expect(adminPage.getByRole("textbox", { name: /Título/ })).toHaveAttribute("aria-invalid", "true");
});

test("el tema se aplica y persiste al recargar", async ({ adminPage }) => {
  await adminPage.getByRole("switch", { name: "Modo oscuro" }).check();
  await adminPage.reload();
  await expect(adminPage.locator("html")).toHaveClass("dark");
  await expect(adminPage.getByRole("switch", { name: "Modo oscuro" })).toBeChecked();
  await adminPage.getByRole("switch", { name: "Modo oscuro" }).uncheck();
  await expect(adminPage.locator("html")).toHaveClass("light");
});

test("las acciones en lote caben en móvil", async ({ adminPage }) => {
  await adminPage.setViewportSize({ width: 375, height: 900 });
  await adminPage.goto("/photos");
  await adminPage.getByRole("checkbox", { name: "Seleccionar Retrato editorial" }).check();
  expect(await adminPage.locator(".admin-main-slot").evaluate((slot) => slot.scrollWidth <= slot.clientWidth + 1)).toBe(
    true,
  );
  await adminPage.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(adminPage.getByRole("alertdialog")).toBeVisible();
});

test("el lote permite seleccionar, revisar y quitar una imagen", async ({ adminPage }) => {
  await adminPage.goto("/photos/new");
  await adminPage.getByLabel("Archivos de imagen").setInputFiles({
    name: "retrato.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==",
      "base64",
    ),
  });
  await expect(adminPage.getByRole("img", { name: "retrato" })).toBeVisible();
  await adminPage.getByRole("combobox", { name: /Sesión/ }).click();
  await adminPage.getByRole("option", { name: /Editorial al atardecer/ }).click();
  await expect(adminPage.getByRole("button", { name: "Subir fotos", exact: true })).toBeEnabled();
  await adminPage.getByRole("button", { name: "Quitar retrato.png" }).click();
  await expect(adminPage.getByRole("button", { name: "Subir fotos", exact: true })).toBeDisabled();
});

test("la lista distingue el estado vacío y una búsqueda sin resultados", async ({ adminPage, procedures }) => {
  await adminPage.goto("/sessions");
  await adminPage.getByRole("searchbox", { name: "Buscar sesiones" }).fill("no existe");
  await expect(adminPage.getByText("No hay sesiones que coincidan. Prueba con otra búsqueda.")).toBeVisible();
  procedures.set("sessions.list", () => []);
  await adminPage.reload();
  await expect(adminPage.getByText("Todavía no hay sesiones. Crea la primera para organizar tus fotos.")).toBeVisible();
});

test("muestra el error de carga y permite reintentar", async ({ adminPage, procedures }) => {
  const listPhotos = procedures.get("photos.list");
  procedures.set("photos.list", () => {
    throw new Error("Unavailable");
  });
  await adminPage.goto("/photos");
  await expect(adminPage.getByText("Datos no disponibles")).toBeVisible();
  if (listPhotos) procedures.set("photos.list", listPhotos);
  await adminPage.getByRole("button", { name: "Reintentar" }).click();
  await expect(adminPage.getByRole("table", { name: "Fotos", exact: true })).toBeVisible();
});
