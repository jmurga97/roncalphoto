import { act } from "react";
import { createRoot } from "react-dom/client";

import { registerMurgaComponents } from "../src";
import {
  McAppShell,
  McButton,
  McConfirmAction,
  McField,
  McInlineMessage,
  McInput,
  McPagination,
  McResourceEditor,
  McSearchField,
  McSelect,
  McStatusText,
  McTextarea,
} from "../src/react";
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

  it("bridges dashboard wrapper props and custom events", async () => {
    const container = document.createElement("div");
    document.body.append(container);

    const root = createRoot(container);
    const sidebarOpenChangeHandler = vi.fn();
    const inputChangeHandler = vi.fn();
    const textareaChangeHandler = vi.fn();
    const searchClearHandler = vi.fn();
    const confirmHandler = vi.fn();
    const pageChangeHandler = vi.fn();
    const saveHandler = vi.fn();

    await act(async () => {
      root.render(
        <div>
          <McAppShell
            mobileOverlay={false}
            sidebarOpen
            onMcSidebarOpenChange={sidebarOpenChangeHandler}
          />
          <McField
            error="Required"
            hint="Field hint"
            inputId="title"
            invalid
            label="Title"
            required
          />
          <McInput
            invalid
            onMcChange={inputChangeHandler}
            placeholder="Session title"
            value="Editorial"
          />
          <McTextarea onMcChange={textareaChangeHandler} rows={8} value="Longer description" />
          <McSearchField onMcClear={searchClearHandler} pending value="urban" />
          <McConfirmAction onMcConfirm={confirmHandler} open pending />
          <McPagination
            hasMore
            onMcPageChange={pageChangeHandler}
            page={2}
            pageSize={12}
            total={40}
          />
          <McResourceEditor
            dirty
            onMcSave={saveHandler}
            resourceTitle="Session"
            saving
            status={{ label: "Draft", tone: "idle" }}
          />
          <McButton pending variant="primary">
            Save
          </McButton>
          <McInlineMessage message="Saved successfully" title="Updated" tone="success" />
          <McStatusText label="Ready" polite tone="success" />
        </div>,
      );
    });

    await flushMicrotasks();

    const appShell = container.querySelector("mc-app-shell");
    const field = container.querySelector("mc-field");
    const input = container.querySelector("mc-input");
    const textarea = container.querySelector("mc-textarea");
    const searchField = container.querySelector("mc-search-field");
    const confirmAction = container.querySelector("mc-confirm-action");
    const pagination = container.querySelector("mc-pagination");
    const resourceEditor = container.querySelector("mc-resource-editor");
    const button = container.querySelector("mc-button");
    const inlineMessage = container.querySelector("mc-inline-message");
    const statusText = container.querySelector("mc-status-text");

    if (
      !(appShell instanceof HTMLElement) ||
      !(field instanceof HTMLElement) ||
      !(input instanceof HTMLElement) ||
      !(textarea instanceof HTMLElement) ||
      !(searchField instanceof HTMLElement) ||
      !(confirmAction instanceof HTMLElement) ||
      !(pagination instanceof HTMLElement) ||
      !(resourceEditor instanceof HTMLElement) ||
      !(button instanceof HTMLElement) ||
      !(inlineMessage instanceof HTMLElement) ||
      !(statusText instanceof HTMLElement)
    ) {
      throw new Error("Expected dashboard wrapper elements");
    }

    expect((appShell as HTMLElement & { sidebarOpen: boolean }).sidebarOpen).toBe(true);
    expect((field as HTMLElement & { error: string }).error).toBe("Required");
    expect((input as HTMLElement & { value: string }).value).toBe("Editorial");
    expect((textarea as HTMLElement & { rows: number }).rows).toBe(8);
    expect((searchField as HTMLElement & { pending: boolean }).pending).toBe(true);
    expect((confirmAction as HTMLElement & { open: boolean }).open).toBe(true);
    expect((pagination as HTMLElement & { page: number }).page).toBe(2);
    expect((resourceEditor as HTMLElement & { resourceTitle: string }).resourceTitle).toBe(
      "Session",
    );
    expect((button as HTMLElement & { variant: string }).variant).toBe("primary");
    expect((inlineMessage as HTMLElement & { title: string }).title).toBe("Updated");
    expect((statusText as HTMLElement & { label: string }).label).toBe("Ready");

    appShell.dispatchEvent(
      new CustomEvent("mc-sidebar-open-change", {
        bubbles: true,
        composed: true,
        detail: { open: false },
      }),
    );
    input.dispatchEvent(
      new CustomEvent("mc-change", {
        bubbles: true,
        composed: true,
        detail: { value: "Retitled" },
      }),
    );
    textarea.dispatchEvent(
      new CustomEvent("mc-change", {
        bubbles: true,
        composed: true,
        detail: { value: "Updated copy" },
      }),
    );
    searchField.dispatchEvent(
      new CustomEvent("mc-clear", {
        bubbles: true,
        composed: true,
        detail: { value: "" },
      }),
    );
    confirmAction.dispatchEvent(
      new CustomEvent("mc-confirm", {
        bubbles: true,
        composed: true,
        detail: { confirmed: true },
      }),
    );
    pagination.dispatchEvent(
      new CustomEvent("mc-page-change", {
        bubbles: true,
        composed: true,
        detail: { page: 3 },
      }),
    );
    resourceEditor.dispatchEvent(
      new CustomEvent("mc-save", {
        bubbles: true,
        composed: true,
        detail: { action: "save" },
      }),
    );

    expect(sidebarOpenChangeHandler).toHaveBeenCalledTimes(1);
    expect(inputChangeHandler).toHaveBeenCalledTimes(1);
    expect(textareaChangeHandler).toHaveBeenCalledTimes(1);
    expect(searchClearHandler).toHaveBeenCalledTimes(1);
    expect(confirmHandler).toHaveBeenCalledTimes(1);
    expect(pageChangeHandler).toHaveBeenCalledTimes(1);
    expect(saveHandler).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
  });
});
