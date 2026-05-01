import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import componentStylesText from "./styles.css?inline";

import { createComponentStyles } from "../../internal/component-styles";

import type { McStatusTone } from "../../internal/contracts";
import { murgaMetaStyles, murgaPanelStyles, murgaThemeStyles } from "../../internal/styles";

export const MC_INLINE_MESSAGE_TAG_NAME = "mc-inline-message";
export const TAG_NAME = MC_INLINE_MESSAGE_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

@customElement(MC_INLINE_MESSAGE_TAG_NAME)
export class McInlineMessage extends LitElement {
  static styles = [murgaThemeStyles, murgaMetaStyles, murgaPanelStyles, componentStyles];

  @property({ type: String, reflect: true })
  tone: McStatusTone = "idle";

  @property({ type: String })
  title = "";

  @property({ type: String })
  message = "";

  render() {
    return html`
      <div class="root" part="root">
        ${this.title ? html`<div class="title" part="title">${this.title}</div>` : nothing}
        ${this.message ? html`<div class="body" part="body">${this.message}</div>` : nothing}
      </div>
    `;
  }
}

export function defineMcInlineMessage() {
  if (!customElements.get(MC_INLINE_MESSAGE_TAG_NAME)) {
    customElements.define(MC_INLINE_MESSAGE_TAG_NAME, McInlineMessage);
  }
}

export type McInlineMessageArgs = Partial<Pick<McInlineMessage, "tone" | "title" | "message">>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-inline-message": McInlineMessage;
  }
}
