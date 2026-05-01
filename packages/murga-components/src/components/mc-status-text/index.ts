import { LitElement, html } from "lit";
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

export class McStatusText extends LitElement {
  static properties = {
    tone: { type: String, reflect: true },
    label: { type: String },
    polite: { type: Boolean, reflect: true },
  };

  static styles = [murgaThemeStyles, murgaMetaStyles, componentStyles];

  tone: McStatusTone = "idle";

  label?: string;

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
