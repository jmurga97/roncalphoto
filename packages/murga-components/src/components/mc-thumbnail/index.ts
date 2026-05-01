import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import componentStylesText from "./styles.css?inline";

import { ifDefined } from "lit/directives/if-defined.js";
import { createComponentStyles } from "../../internal/component-styles";

import type { McThumbnailRatio } from "../../internal/contracts";
import { dispatchMcEvent } from "../../internal/events";
import { murgaMetaStyles, murgaThemeStyles } from "../../internal/styles";

export const MC_THUMBNAIL_TAG_NAME = "mc-thumbnail";
export const TAG_NAME = MC_THUMBNAIL_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

@customElement(MC_THUMBNAIL_TAG_NAME)
export class McThumbnail extends LitElement {
  static styles = [murgaThemeStyles, murgaMetaStyles, componentStyles];

  @property({ type: String, attribute: "item-id" })
  itemId = "";

  @property({ type: String })
  src?: string;

  @property({ type: String })
  alt = "";

  @property({ type: Boolean, reflect: true })
  selected = false;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  loading = false;

  @property({ type: String })
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
