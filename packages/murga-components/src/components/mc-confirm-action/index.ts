import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import componentStylesText from "./styles.css?inline";

import { createComponentStyles } from "../../internal/component-styles";

import type { McStatusTone } from "../../internal/contracts";
import { dispatchMcEvent } from "../../internal/events";
import { murgaButtonStyles, murgaPanelStyles, murgaThemeStyles } from "../../internal/styles";

export const MC_CONFIRM_ACTION_TAG_NAME = "mc-confirm-action";
export const TAG_NAME = MC_CONFIRM_ACTION_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

@customElement(MC_CONFIRM_ACTION_TAG_NAME)
export class McConfirmAction extends LitElement {
  static styles = [murgaThemeStyles, murgaPanelStyles, murgaButtonStyles, componentStyles];

  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: String, reflect: true })
  tone: McStatusTone = "error";

  @property({ type: String })
  message = "Confirm action";

  @property({ type: String, attribute: "confirm-label" })
  confirmLabel = "[CONFIRM]";

  @property({ type: String, attribute: "cancel-label" })
  cancelLabel = "[CANCEL]";

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
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
