import { LitElement, html } from "lit";
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

export class McThumbnailRail extends LitElement {
  static properties = {
    items: { attribute: false },
    selectedId: { type: String, attribute: "selected-id" },
    ariaLabel: { type: String, attribute: "aria-label" },
    orientation: { type: String, reflect: true },
  };

  static styles = [murgaThemeStyles, componentStyles];

  items: McMediaItem[] = [];

  selectedId?: string;

  ariaLabel = "Media thumbnails";

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
