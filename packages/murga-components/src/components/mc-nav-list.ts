import { LitElement, css, html } from "lit";
import { repeat } from "lit/directives/repeat.js";

import type { McNavItem, McOrientation } from "../internal/contracts";
import { dispatchMcEvent } from "../internal/events";
import { murgaLabelStyles, murgaMetaStyles, murgaThemeStyles } from "../internal/styles";

export const MC_NAV_LIST_TAG_NAME = "mc-nav-list";
export const TAG_NAME = MC_NAV_LIST_TAG_NAME;

export class McNavList extends LitElement {
  static properties = {
    items: { attribute: false },
    ariaLabel: { type: String, attribute: "aria-label" },
    orientation: { type: String, reflect: true },
  };

  static styles = [
    murgaThemeStyles,
    murgaLabelStyles,
    murgaMetaStyles,
    css`
      .list {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      :host([orientation="horizontal"]) .list {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-sm);
        border: 0;
        border-bottom: 1px solid var(--border);
        background: transparent;
        min-block-size: 44px;
        padding: 12px 0;
        text-align: left;
        color: var(--text-secondary);
        cursor: pointer;
      }

      .item[data-current="true"] {
        color: var(--text-display);
      }

      .label {
        flex: 1;
      }
    `,
  ];

  items: McNavItem[] = [];

  ariaLabel = "Navigation";

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
