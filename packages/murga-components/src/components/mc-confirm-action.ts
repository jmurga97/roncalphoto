import { LitElement, css, html, nothing } from "lit";

import type { McStatusTone } from "../internal/contracts";
import { dispatchMcEvent } from "../internal/events";
import { murgaButtonStyles, murgaPanelStyles, murgaThemeStyles } from "../internal/styles";

export const MC_CONFIRM_ACTION_TAG_NAME = "mc-confirm-action";
export const TAG_NAME = MC_CONFIRM_ACTION_TAG_NAME;

export class McConfirmAction extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    tone: { type: String, reflect: true },
    message: { type: String },
    confirmLabel: { type: String, attribute: "confirm-label" },
    cancelLabel: { type: String, attribute: "cancel-label" },
    disabled: { type: Boolean, reflect: true },
    pending: { type: Boolean, reflect: true },
  };

  static styles = [
    murgaThemeStyles,
    murgaPanelStyles,
    murgaButtonStyles,
    css`
      .root {
        display: grid;
        gap: var(--space-md);
        padding: var(--space-md);
      }

      .message {
        color: var(--text-primary);
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm);
      }

      button[data-tone="confirm"] {
        border-color: var(--accent);
        color: var(--accent);
      }
    `,
  ];

  open = false;

  tone: McStatusTone = "error";

  message = "Confirm action";

  confirmLabel = "[CONFIRM]";

  cancelLabel = "[CANCEL]";

  disabled = false;

  pending = false;

  #handleConfirm() {
    dispatchMcEvent(this, "mc-confirm", { confirmed: true });
  }

  #handleCancel() {
    dispatchMcEvent(this, "mc-cancel", { open: false });
    dispatchMcEvent(this, "mc-open-change", { open: false });
  }

  render() {
    if (!this.open) {
      return nothing;
    }

    return html`
      <div class="root" part="root">
        <div class="message" part="message">${this.message}</div>
        <div class="actions" part="actions">
          <button
            data-tone="confirm"
            type="button"
            ?disabled=${this.disabled || this.pending}
            @click=${this.#handleConfirm}
          >
            ${this.pending ? "[LOADING]" : this.confirmLabel}
          </button>
          <button type="button" ?disabled=${this.disabled || this.pending} @click=${this.#handleCancel}>
            ${this.cancelLabel}
          </button>
        </div>
      </div>
    `;
  }
}

export function defineMcConfirmAction() {
  if (!customElements.get(MC_CONFIRM_ACTION_TAG_NAME)) {
    customElements.define(MC_CONFIRM_ACTION_TAG_NAME, McConfirmAction);
  }
}

export type McConfirmActionArgs = Partial<
  Pick<
    McConfirmAction,
    "open" | "tone" | "message" | "confirmLabel" | "cancelLabel" | "disabled" | "pending"
  >
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-confirm-action": McConfirmAction;
  }
}
