import { LitElement, html } from "lit";
import componentStylesText from "./styles.css?inline";

import { ifDefined } from "lit/directives/if-defined.js";
import { createComponentStyles } from "../../internal/component-styles";

import type { McThumbnailRatio } from "../../internal/contracts";
import { dispatchMcEvent } from "../../internal/events";
import { murgaMetaStyles, murgaThemeStyles } from "../../internal/styles";

export const MC_THUMBNAIL_TAG_NAME = "mc-thumbnail";
export const TAG_NAME = MC_THUMBNAIL_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

export class McThumbnail extends LitElement {
  static properties = {
    itemId: { type: String, attribute: "item-id" },
    src: { type: String },
    alt: { type: String },
    selected: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    loading: { type: Boolean, reflect: true },
    ratio: { type: String },
  };

  static styles = [murgaThemeStyles, murgaMetaStyles, componentStyles];

  itemId = "";

  src?: string;

  alt = "";

  selected = false;

  disabled = false;

  loading = false;

  ratio: McThumbnailRatio = "square";

  #handleClick() {
    if (this.disabled || this.itemId.length === 0) {
      return;
    }

    dispatchMcEvent(this, "mc-select", { selectedId: this.itemId });
  }

  render() {
    return html`
      <button
        part="button"
        type="button"
        aria-pressed=${this.selected ? "true" : "false"}
        aria-label=${ifDefined(this.alt || this.itemId)}
        ?disabled=${this.disabled}
        @click=${this.#handleClick}
      >
        <span class="frame" data-ratio=${this.ratio}>
          ${
            this.src && !this.loading
              ? html`<img part="image" src=${this.src} alt=${this.alt} />`
              : html`<span class="placeholder">${this.loading ? "[LOADING]" : "[EMPTY]"}</span>`
          }
        </span>
      </button>
    `;
  }
}

export function defineMcThumbnail() {
  if (!customElements.get(MC_THUMBNAIL_TAG_NAME)) {
    customElements.define(MC_THUMBNAIL_TAG_NAME, McThumbnail);
  }
}

export type McThumbnailArgs = Partial<
  Pick<McThumbnail, "itemId" | "src" | "alt" | "selected" | "disabled" | "loading" | "ratio">
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-thumbnail": McThumbnail;
  }
}
