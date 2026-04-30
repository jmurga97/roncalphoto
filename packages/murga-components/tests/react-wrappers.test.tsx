import { act } from "react";
import { createRoot } from "react-dom/client";

import { registerMurgaComponents } from "../src";
import { McSelect } from "../src/react";
import { flushMicrotasks } from "./helpers";

describe("react wrappers", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    registerMurgaComponents();
  });

  it("bridges structured props and custom events for McSelect", async () => {
    const container = document.createElement("div");
    document.body.append(container);

    const root = createRoot(container);
    const changeHandler = vi.fn();

    await act(async () => {
      root.render(
        <McSelect
          options={[
            { id: "session", label: "Session" },
            { id: "photo", label: "Photo" },
          ]}
          selectedId="session"
          open
          onMcChange={changeHandler}
        />,
      );
    });

    await flushMicrotasks();

    const element = container.querySelector("mc-select");

    if (!(element instanceof HTMLElement) || !("options" in element)) {
      throw new Error("Expected mc-select element");
    }

    expect((element as HTMLElement & { options: Array<{ id: string }> }).options).toHaveLength(2);

    element.dispatchEvent(
      new CustomEvent("mc-change", {
        bubbles: true,
        composed: true,
        detail: { selectedId: "photo" },
      }),
    );

    expect(changeHandler).toHaveBeenCalledTimes(1);
    expect(
      (changeHandler.mock.calls[0]?.[0] as CustomEvent<{ selectedId: string }>).detail.selectedId,
    ).toBe("photo");

    await act(async () => {
      root.unmount();
    });
  });
});
