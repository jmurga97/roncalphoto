import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import componentStylesText from "./styles.css?inline";

import { repeat } from "lit/directives/repeat.js";
import { createComponentStyles } from "../../internal/component-styles";

import type { McNavItem } from "../../internal/contracts";
import { dispatchMcEvent } from "../../internal/events";
import {
  murgaLabelStyles,
  murgaMetaStyles,
  murgaSurfaceStyles,
  murgaThemeStyles,
} from "../../internal/styles";

export const MC_RELATIONSHIP_PANEL_TAG_NAME = "mc-relationship-panel";
export const TAG_NAME = MC_RELATIONSHIP_PANEL_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

@customElement(MC_RELATIONSHIP_PANEL_TAG_NAME)
export class McRelationshipPanel extends LitElement {
  static styles = [
    murgaThemeStyles,
    murgaSurfaceStyles,
    murgaLabelStyles,
    murgaMetaStyles,
    componentStyles,
  ];

  @property({ type: String })
  title = "";

  @property({ attribute: false })
  items: McNavItem[] = [];

  @property({ type: String, attribute: "empty-label" })
  emptyLabel = "No related items";

  #handleSelect(itemId: string) {
    dispatchMcEvent(this, "mc-select", { selectedId: itemId });
  }

  render() {
    return html`
      <aside class="root" part="root">
        <slot name="header"></slot>
        <div part="header">${this.title}</div>
        ${
          this.items.length > 0
            ? html`
              <div class="list" part="list">
                ${repeat(
                  this.items,
                  (item) => item.id,
                  (item) => html`
                    <button class="item" type="button" @click=${() => this.#handleSelect(item.id)}>
                      <span>${item.label}</span>
                      ${item.count !== undefined ? html`<span>${item.count}</span>` : null}
                    </button>
                  `,
                )}
              </div>
            `
            : html`<div class="empty" part="empty">${this.emptyLabel}</div>`
        }
        <slot name="footer"></slot>
      </aside>
    `;
  }
}

export function defineMcRelationshipPanel() {
  if (!customElements.get(MC_RELATIONSHIP_PANEL_TAG_NAME)) {
    customElements.define(MC_RELATIONSHIP_PANEL_TAG_NAME, McRelationshipPanel);
  }
}

export type McRelationshipPanelArgs = Partial<
  Pick<McRelationshipPanel, "title" | "items" | "emptyLabel">
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-relationship-panel": McRelationshipPanel;
  }
}
