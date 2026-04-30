import { McCheckbox } from "../src/components/mc-checkbox";
import { McInput } from "../src/components/mc-input";
import { McSelect } from "../src/components/mc-select";
import { McThumbnail } from "../src/components/mc-thumbnail";
import { registerMurgaComponents } from "../src/index";
import { appendAndFlush, flushMicrotasks } from "./helpers";

describe("atomic components", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    registerMurgaComponents();
  });

  it("forwards aria and input state in mc-input", async () => {
    const input = new McInput();
    input.value = "Initial";
    input.invalid = true;
    input.ariaLabel = "Session title";
    input.setAttribute("aria-describedby", "session-title-hint");

    await appendAndFlush(input);

    const nativeInput = input.shadowRoot?.querySelector("input");

    expect(nativeInput?.getAttribute("aria-label")).toBe("Session title");
    expect(nativeInput?.getAttribute("aria-describedby")).toBe("session-title-hint");
    expect(nativeInput?.getAttribute("aria-invalid")).toBe("true");
    expect(nativeInput?.getAttribute("part")).toBe("input");

    const handleInput = vi.fn();
    input.addEventListener("mc-input", handleInput as EventListener);

    if (!nativeInput) {
      throw new Error("Expected native input");
    }

    nativeInput.value = "Updated";
    nativeInput.dispatchEvent(new Event("input", { bubbles: true }));

    expect(handleInput).toHaveBeenCalledTimes(1);
    expect((handleInput.mock.calls[0]?.[0] as CustomEvent<{ value: string }>).detail.value).toBe(
      "Updated",
    );
  });

  it("emits selection and open change events in mc-select", async () => {
    const select = new McSelect();
    select.options = [
      { id: "featured", label: "Featured" },
      { id: "archive", label: "Archive" },
    ];

    await appendAndFlush(select);

    const openHandler = vi.fn();
    select.addEventListener("mc-open-change", openHandler as EventListener);

    const trigger = select.shadowRoot?.querySelector<HTMLButtonElement>(".trigger");

    if (!trigger) {
      throw new Error("Expected trigger button");
    }

    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));

    expect((openHandler.mock.calls[0]?.[0] as CustomEvent<{ open: boolean }>).detail.open).toBe(
      true,
    );

    select.open = true;
    await select.updateComplete;
    await flushMicrotasks();

    const changeHandler = vi.fn();
    select.addEventListener("mc-change", changeHandler as EventListener);

    const optionButton = select.shadowRoot?.querySelectorAll<HTMLButtonElement>(".option")[1];

    if (!optionButton) {
      throw new Error("Expected option button");
    }

    optionButton.click();

    expect(
      (changeHandler.mock.calls[0]?.[0] as CustomEvent<{ selectedId: string }>).detail.selectedId,
    ).toBe("archive");
  });

  it("reflects checked state and emits detail in mc-checkbox", async () => {
    const checkbox = new McCheckbox();
    checkbox.checked = true;

    await appendAndFlush(checkbox);

    expect(checkbox.hasAttribute("checked")).toBe(true);

    const changeHandler = vi.fn();
    checkbox.addEventListener("mc-change", changeHandler as EventListener);

    const nativeInput = checkbox.shadowRoot?.querySelector<HTMLInputElement>("input");

    if (!nativeInput) {
      throw new Error("Expected checkbox input");
    }

    nativeInput.checked = false;
    nativeInput.dispatchEvent(new Event("change", { bubbles: true }));

    expect(
      (changeHandler.mock.calls[0]?.[0] as CustomEvent<{ checked: boolean }>).detail.checked,
    ).toBe(false);
  });

  it("emits mc-select from mc-thumbnail", async () => {
    const thumbnail = new McThumbnail();
    thumbnail.itemId = "photo-001";
    thumbnail.alt = "Photo 001";

    await appendAndFlush(thumbnail);

    const selectHandler = vi.fn();
    thumbnail.addEventListener("mc-select", selectHandler as EventListener);

    const button = thumbnail.shadowRoot?.querySelector("button");

    if (!button) {
      throw new Error("Expected thumbnail button");
    }

    button.click();

    expect(
      (selectHandler.mock.calls[0]?.[0] as CustomEvent<{ selectedId: string }>).detail.selectedId,
    ).toBe("photo-001");
  });
});
