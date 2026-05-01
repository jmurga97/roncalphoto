import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import componentStylesText from "./styles.css?inline";

import { createComponentStyles } from "../../internal/component-styles";

import type { McStatusTone } from "../../internal/contracts";
import { murgaMetaStyles, murgaThemeStyles } from "../../internal/styles";

export const MC_STATUS_TEXT_TAG_NAME = "mc-status-text";
export const TAG_NAME = MC_STATUS_TEXT_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

function getDefaultLabel(tone: McStatusTone) {
  switch (tone) {
    case "loading":
      return "[LOADING]";
    case "success":
      return "[SAVED]";
    case "error":
      return "[ERROR]";
    default:
      return "[IDLE]";
  }
}

@customElement(MC_STATUS_TEXT_TAG_NAME)
export class McStatusText extends LitElement {
  static styles = [murgaThemeStyles, murgaMetaStyles, componentStyles];

  @property({ type: String, reflect: true })
  tone: McStatusTone = "idle";

  @property({ type: String })
  label?: string;

  @property({ type: Boolean, reflect: true })
  polite = false;

  render() {
    return html`
      <span
        class="text"
        part="text"
        role=${this.polite ? "status" : "presentation"}
        aria-live=${this.polite ? "polite" : "off"}
      >
        ${this.label ?? getDefaultLabel(this.tone)}
      </span>
    `;
  }
}

export function defineMcStatusText() {
  if (!customElements.get(MC_STATUS_TEXT_TAG_NAME)) {
    customElements.define(MC_STATUS_TEXT_TAG_NAME, McStatusText);
  }
}

export type McStatusTextArgs = Partial<Pick<McStatusText, "tone" | "label" | "polite">>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-status-text": McStatusText;
  }
}
