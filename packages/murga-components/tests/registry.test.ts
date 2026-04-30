import { murgaComponentRegistry, registerMurgaComponents } from "../src";

describe("@murga/components registry", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("registers the implemented components idempotently", () => {
    expect(murgaComponentRegistry).not.toContain("mc-placeholder");

    registerMurgaComponents();
    registerMurgaComponents();

    expect(customElements.get("mc-button")).toBeDefined();
    expect(customElements.get("mc-sidebar-nav")).toBeDefined();
    expect(customElements.get("mc-resource-table")).toBeDefined();
  });
});
