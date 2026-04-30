import { LitElement, css, html } from "lit";
import { repeat } from "lit/directives/repeat.js";

import type { McTagItem } from "../internal/contracts";
import { dispatchMcEvent } from "../internal/events";
import { normalizeSelectedIds, toggleSelectedId } from "../internal/selection";
import { murgaLabelStyles, murgaThemeStyles } from "../internal/styles";

export const MC_TAG_LIST_TAG_NAME = "mc-tag-list";
export const TAG_NAME = MC_TAG_LIST_TAG_NAME;

export class McTagList extends LitElement {
  static properties = {
    items: { attribute: false },
    selectedIds: { attribute: false },
    interactive: { type: Boolean, reflect: true },
  };

  static styles = [
    murgaThemeStyles,
    murgaLabelStyles,
    css`
      .list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm);
      }

      .item {
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--border-visible);
        border-radius: 999px;
        min-block-size: 28px;
        padding: 4px 12px;
        background: transparent;
        color: var(--text-secondary);
      }

      button.item {
        cursor: pointer;
      }

      .item[data-selected="true"] {
        border-color: var(--text-display);
        color: var(--text-display);
      }
    `,
  ];

  items: McTagItem[] = [];

  selectedIds: string[] = [];

  interactive = false;

  #getResolvedSelectedIds() {
    return this.selectedIds.length > 0
      ? normalizeSelectedIds(this.selectedIds)
      : this.items.filter((item) => item.selected).map((item) => item.id);
  }

  #handleSelect(itemId: string) {
    const nextSelectedIds = toggleSelectedId(this.#getResolvedSelectedIds(), itemId);
    dispatchMcEvent(this, "mc-select", { itemId, selectedIds: nextSelectedIds });
  }

  render() {
    const selectedIds = this.#getResolvedSelectedIds();

    return html`
      <div class="list" part="list">
        ${repeat(
          this.items,
          (item) => item.id,
          (item) => {
            const isSelected = selectedIds.includes(item.id);

            return this.interactive
              ? html`
                  <button
                    class="item"
                    part="item"
                    data-selected=${isSelected ? "true" : "false"}
                    type="button"
                    @click=${() => this.#handleSelect(item.id)}
                  >
                    ${item.label}
                  </button>
                `
              : html`
                  <span class="item" part="item" data-selected=${isSelected ? "true" : "false"}>
                    ${item.label}
                  </span>
                `;
          },
        )}
      </div>
    `;
  }
}

export function defineMcTagList() {
  if (!customElements.get(MC_TAG_LIST_TAG_NAME)) {
    customElements.define(MC_TAG_LIST_TAG_NAME, McTagList);
  }
}

export type McTagListArgs = Partial<Pick<McTagList, "items" | "selectedIds" | "interactive">>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-tag-list": McTagList;
  }
}
