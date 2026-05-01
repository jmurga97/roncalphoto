import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import componentStylesText from "./styles.css?inline";

import { repeat } from "lit/directives/repeat.js";
import { createComponentStyles } from "../../internal/component-styles";

import type { McMediaItem, McOrientation } from "../../internal/contracts";
import { dispatchMcEvent } from "../../internal/events";
import { murgaThemeStyles } from "../../internal/styles";

import "../mc-thumbnail";

export const MC_THUMBNAIL_RAIL_TAG_NAME = "mc-thumbnail-rail";
export const TAG_NAME = MC_THUMBNAIL_RAIL_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

@customElement(MC_THUMBNAIL_RAIL_TAG_NAME)
export class McThumbnailRail extends LitElement {
  static styles = [murgaThemeStyles, componentStyles];

  @property({ attribute: false })
  items: McMediaItem[] = [];

  @property({ type: String, attribute: "selected-id" })
  selectedId?: string;

  @property({ type: String, attribute: "aria-label" })
  ariaLabel = "Media thumbnails";

  @property({ type: String, reflect: true })
  orientation: McOrientation = "horizontal";

  #handleSelect(event: Event) {
    const detail = (event as CustomEvent<{ selectedId: string }>).detail;
    dispatchMcEvent(this, "mc-select", { selectedId: detail.selectedId });
  }

  render() {
    return html`
      <div class="rail" part="rail" aria-label=${this.ariaLabel} role="list">
        ${repeat(
          this.items,
          (item) => item.id,
          (item) => html`
            <div class="item" part="item" role="listitem">
              <mc-thumbnail
                .itemId=${item.id}
                .src=${item.thumbnailSrc ?? item.src}
                .alt=${item.alt}
                .selected=${this.selectedId === item.id}
                @mc-select=${this.#handleSelect}
              ></mc-thumbnail>
            </div>
          `,
        )}
      </div>
    `;
  }
}

export function defineMcThumbnailRail() {
  if (!customElements.get(MC_THUMBNAIL_RAIL_TAG_NAME)) {
    customElements.define(MC_THUMBNAIL_RAIL_TAG_NAME, McThumbnailRail);
  }
}

export type McThumbnailRailArgs = Partial<
  Pick<McThumbnailRail, "items" | "selectedId" | "ariaLabel" | "orientation">
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-thumbnail-rail": McThumbnailRail;
  }
}
