import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import componentStylesText from "./styles.css?inline";

import { repeat } from "lit/directives/repeat.js";
import { createComponentStyles } from "../../internal/component-styles";

import type { McNavItem, McOrientation } from "../../internal/contracts";
import { dispatchMcEvent } from "../../internal/events";
import { murgaLabelStyles, murgaMetaStyles, murgaThemeStyles } from "../../internal/styles";

export const MC_NAV_LIST_TAG_NAME = "mc-nav-list";
export const TAG_NAME = MC_NAV_LIST_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

@customElement(MC_NAV_LIST_TAG_NAME)
export class McNavList extends LitElement {
  static styles = [murgaThemeStyles, murgaLabelStyles, murgaMetaStyles, componentStyles];

  @property({ attribute: false })
  items: McNavItem[] = [];

  @property({ type: String, attribute: "aria-label" })
  ariaLabel = "Navigation";

  @property({ type: String, reflect: true })
  orientation: McOrientation = "vertical";

  #handleSelect(itemId: string) {
    dispatchMcEvent(this, "mc-select", { selectedId: itemId });
  }

  render() {
    return html`
      <nav aria-label=${this.ariaLabel}>
        <div class="list" part="list">
          ${repeat(
            this.items,
            (item) => item.id,
            (item) => html`
              <button
                class="item"
                part="item"
                type="button"
                data-current=${item.current ? "true" : "false"}
                aria-current=${item.current ? "page" : nothing}
                @click=${() => this.#handleSelect(item.id)}
              >
                <span class="label" part="label">${item.label}</span>
                ${item.count !== undefined ? html`<span part="meta">${item.count}</span>` : null}
              </button>
            `,
          )}
        </div>
      </nav>
    `;
  }
}

export function defineMcNavList() {
  if (!customElements.get(MC_NAV_LIST_TAG_NAME)) {
    customElements.define(MC_NAV_LIST_TAG_NAME, McNavList);
  }
}

export type McNavListArgs = Partial<Pick<McNavList, "items" | "ariaLabel" | "orientation">>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-nav-list": McNavList;
  }
}
