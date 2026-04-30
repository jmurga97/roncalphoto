import { LitElement, css, html, nothing } from "lit";

import type { McButtonSize, McButtonVariant } from "../internal/contracts";
import { murgaButtonStyles, murgaThemeStyles } from "../internal/styles";

export const MC_BUTTON_TAG_NAME = "mc-button";
export const TAG_NAME = MC_BUTTON_TAG_NAME;

export class McButton extends LitElement {
  static properties = {
    variant: { type: String },
    size: { type: String },
    type: { type: String },
    disabled: { type: Boolean, reflect: true },
    pending: { type: Boolean, reflect: true },
    ariaLabel: { type: String, attribute: "aria-label" },
  };

  static styles = [
    murgaThemeStyles,
    murgaButtonStyles,
    css`
      button {
        inline-size: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
      }

      button[data-variant="primary"] {
        background: var(--text-display);
        border-color: transparent;
        color: var(--black);
      }

      button[data-variant="ghost"] {
        border-color: transparent;
        color: var(--text-secondary);
        padding-inline: 0;
      }

      button[data-variant="destructive"] {
        border-color: var(--accent);
        color: var(--accent);
      }

      button[data-size="sm"] {
        min-block-size: 36px;
        padding: 8px 16px;
      }

      .label {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
      }

      .icon {
        display: inline-flex;
        align-items: center;
      }

      .pending {
        color: var(--text-secondary);
      }
    `,
  ];

  variant: McButtonVariant = "secondary";

  size: McButtonSize = "md";

  type: "button" | "submit" | "reset" = "button";

  disabled = false;

  pending = false;

  ariaLabel: string | null = null;

  render() {
    return html`
      <button
        part="button"
        data-size=${this.size}
        data-variant=${this.variant}
        type=${this.type}
        ?disabled=${this.disabled || this.pending}
        aria-busy=${this.pending ? "true" : "false"}
        aria-label=${this.ariaLabel ?? nothing}
      >
        <span class="icon" part="icon">
          <slot name="icon-start"></slot>
        </span>
        <span class="label" part="label">
          <slot></slot>
          ${this.pending ? html`<span class="pending">[LOADING]</span>` : nothing}
        </span>
        <span class="icon" part="icon">
          <slot name="icon-end"></slot>
        </span>
      </button>
    `;
  }
}

export function defineMcButton() {
  if (!customElements.get(MC_BUTTON_TAG_NAME)) {
    customElements.define(MC_BUTTON_TAG_NAME, McButton);
  }
}

export type McButtonArgs = Partial<
  Pick<McButton, "variant" | "size" | "type" | "disabled" | "pending" | "ariaLabel">
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-button": McButton;
  }
}
