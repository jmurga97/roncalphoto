import { McAppShell } from "../src/components/mc-app-shell";
import { McMediaBrowser } from "../src/components/mc-media-browser";
import { McPagination } from "../src/components/mc-pagination";
import { McResourceTable } from "../src/components/mc-resource-table";
import { McTagList } from "../src/components/mc-tag-list";
import { registerMurgaComponents } from "../src/index";
import { appendAndFlush, flushMicrotasks } from "./helpers";

describe("composed components", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    registerMurgaComponents();
  });

  it("toggles next selected ids in mc-tag-list", async () => {
    const tagList = new McTagList();
    tagList.interactive = true;
    tagList.items = [
      { id: "portrait", label: "Portrait" },
      { id: "editorial", label: "Editorial" },
    ];
    tagList.selectedIds = ["portrait"];

    await appendAndFlush(tagList);

    const selectHandler = vi.fn();
    tagList.addEventListener("mc-select", selectHandler as EventListener);

    const button = tagList.shadowRoot?.querySelectorAll<HTMLButtonElement>("button")[1];

    if (!button) {
      throw new Error("Expected tag button");
    }

    button.click();

    expect(
      (selectHandler.mock.calls[0]?.[0] as CustomEvent<{ selectedIds: string[] }>).detail
        .selectedIds,
    ).toEqual(["portrait", "editorial"]);
  });

  it("emits page changes in mc-pagination", async () => {
    const pagination = new McPagination();
    pagination.page = 2;
    pagination.pageSize = 10;
    pagination.total = 40;

    await appendAndFlush(pagination);

    const pageHandler = vi.fn();
    pagination.addEventListener("mc-page-change", pageHandler as EventListener);

    const nextButton = pagination.shadowRoot?.querySelectorAll<HTMLButtonElement>("button")[1];

    if (!nextButton) {
      throw new Error("Expected next button");
    }

    nextButton.click();

    expect((pageHandler.mock.calls[0]?.[0] as CustomEvent<{ page: number }>).detail.page).toBe(3);
  });

  it("traps and restores focus in mc-app-shell overlay mode", async () => {
    const launcher = document.createElement("button");
    launcher.textContent = "launcher";
    document.body.append(launcher);
    launcher.focus();

    const shell = new McAppShell();
    shell.sidebarOpen = true;
    shell.mobileOverlay = true;

    const sidebarButton = document.createElement("button");
    sidebarButton.slot = "sidebar";
    sidebarButton.textContent = "Sidebar action";
    shell.append(sidebarButton);

    await appendAndFlush(shell);

    expect(document.activeElement).toBe(sidebarButton);

    shell.sidebarOpen = false;
    await shell.updateComplete;
    await flushMicrotasks();

    expect(document.activeElement).toBe(launcher);
  });

  it("emits sort and row selection in mc-resource-table", async () => {
    const table = new McResourceTable();
    table.columns = [
      { id: "name", label: "Name", sortable: true },
      { id: "count", label: "Count", align: "end" },
    ];
    table.rows = [
      { id: "row-1", cells: { name: "Session A", count: 12 } },
      { id: "row-2", cells: { name: "Session B", count: 5 } },
    ];

    await appendAndFlush(table);

    const sortHandler = vi.fn();
    const rowHandler = vi.fn();
    table.addEventListener("mc-sort", sortHandler as EventListener);
    table.addEventListener("mc-row-select", rowHandler as EventListener);

    const headerButton = table.shadowRoot?.querySelector<HTMLButtonElement>(".sort-button");
    const firstRow = table.shadowRoot?.querySelector<HTMLTableRowElement>("tbody tr");

    if (!headerButton || !firstRow) {
      throw new Error("Expected table controls");
    }

    headerButton.click();
    firstRow.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(
      (sortHandler.mock.calls[0]?.[0] as CustomEvent<{ columnId: string }>).detail.columnId,
    ).toBe("name");
    expect(
      (rowHandler.mock.calls[0]?.[0] as CustomEvent<{ selectedId: string }>).detail.selectedId,
    ).toBe("row-1");
  });

  it("navigates media with arrow keys in mc-media-browser", async () => {
    const mediaBrowser = new McMediaBrowser();
    mediaBrowser.items = [
      { id: "photo-1", src: "/one.jpg", alt: "One" },
      { id: "photo-2", src: "/two.jpg", alt: "Two" },
    ];
    mediaBrowser.selectedId = "photo-1";

    await appendAndFlush(mediaBrowser);

    const selectHandler = vi.fn();
    mediaBrowser.addEventListener("mc-select", selectHandler as EventListener);

    const root = mediaBrowser.shadowRoot?.querySelector<HTMLElement>(".root");

    if (!root) {
      throw new Error("Expected media browser root");
    }

    root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

    expect(
      (selectHandler.mock.calls[0]?.[0] as CustomEvent<{ selectedId: string }>).detail.selectedId,
    ).toBe("photo-2");
  });
});
