import { LitElement, css, html } from "lit";

import type { McBadgeTone } from "../internal/contracts";
import { murgaLabelStyles, murgaThemeStyles } from "../internal/styles";

export const MC_BADGE_TAG_NAME = "mc-badge";
export const TAG_NAME = MC_BADGE_TAG_NAME;

export class McBadge extends LitElement {
  static properties = {
    tone: { type: String, reflect: true },
  };

  static styles = [
    murgaThemeStyles,
    murgaLabelStyles,
    css`
      .base {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-visible);
        border-radius: 999px;
        min-block-size: 24px;
        padding: 4px 12px;
        color: var(--text-secondary);
      }

      :host([tone="accent"]) .base,
      :host([tone="error"]) .base {
        border-color: var(--accent);
        color: var(--accent);
      }

      :host([tone="success"]) .base {
        border-color: var(--success);
        color: var(--success);
      }

      :host([tone="warning"]) .base {
        border-color: var(--warning);
        color: var(--warning);
      }
    `,
  ];

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
