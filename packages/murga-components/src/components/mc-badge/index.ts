import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import componentStylesText from "./styles.css?inline";

import { createComponentStyles } from "../../internal/component-styles";

import type { McBadgeTone } from "../../internal/contracts";
import { murgaLabelStyles, murgaThemeStyles } from "../../internal/styles";

export const MC_BADGE_TAG_NAME = "mc-badge";
export const TAG_NAME = MC_BADGE_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

@customElement(MC_BADGE_TAG_NAME)
export class McBadge extends LitElement {
  static styles = [murgaThemeStyles, murgaLabelStyles, componentStyles];

  @property({ type: String, reflect: true })
  tone: McBadgeTone = "default";

  render() {
    return html`
      <span class="base" part="base">
        <span part="label">
          <slot></slot>
        </span>
      </span>
    `;
  }
}

export function defineMcBadge() {
  if (!customElements.get(MC_BADGE_TAG_NAME)) {
    customElements.define(MC_BADGE_TAG_NAME, McBadge);
  }
}

export type McBadgeArgs = Partial<Pick<McBadge, "tone">>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-badge": McBadge;
  }
}
