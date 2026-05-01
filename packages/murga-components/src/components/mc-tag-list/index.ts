import { LitElement, type PropertyValues, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import componentStylesText from "./styles.css?inline";

import { repeat } from "lit/directives/repeat.js";
import { createComponentStyles } from "../../internal/component-styles";

import type { McTagItem } from "../../internal/contracts";
import { dispatchMcEvent } from "../../internal/events";
import { normalizeSelectedIds, toggleSelectedId } from "../../internal/selection";
import { murgaLabelStyles, murgaThemeStyles } from "../../internal/styles";

export const MC_TAG_LIST_TAG_NAME = "mc-tag-list";
export const TAG_NAME = MC_TAG_LIST_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

@customElement(MC_TAG_LIST_TAG_NAME)
export class McTagList extends LitElement {
  static styles = [murgaThemeStyles, murgaLabelStyles, componentStyles];

  @property({ attribute: false })
  items: McTagItem[] = [];

  @property({ attribute: false })
  selectedIds: string[] = [];

  @property({ type: Boolean, reflect: true })
  interactive = false;

  @state()
  private resolvedSelectedIds: string[] = [];

  protected willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("items") || changedProperties.has("selectedIds")) {
      this.resolvedSelectedIds =
        this.selectedIds.length > 0
          ? normalizeSelectedIds(this.selectedIds)
          : this.items.filter((item) => item.selected).map((item) => item.id);
    }
  }

  #handleSelect(itemId: string) {
    const nextSelectedIds = toggleSelectedId(this.resolvedSelectedIds, itemId);
    dispatchMcEvent(this, "mc-select", { itemId, selectedIds: nextSelectedIds });
  }

  render() {
    return html`
      <div class="list" part="list">
        ${repeat(
          this.items,
          (item) => item.id,
          (item) => {
            const isSelected = this.resolvedSelectedIds.includes(item.id);

            return this.interactive
              ? html`
                  <button
                    class="item"
                    part="item"
                    data-selected=${isSelected ? "true" : "false"}
                    type="button"
                    aria-pressed=${isSelected ? "true" : "false"}
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
