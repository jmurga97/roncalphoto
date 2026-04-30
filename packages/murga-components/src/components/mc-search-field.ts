import { LitElement, css, html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

import { syncAriaAttributes } from "../internal/attributes";
import { dispatchMcEvent } from "../internal/events";
import { murgaButtonStyles, murgaInputSurfaceStyles, murgaThemeStyles } from "../internal/styles";

export const MC_SEARCH_FIELD_TAG_NAME = "mc-search-field";
export const TAG_NAME = MC_SEARCH_FIELD_TAG_NAME;

export class McSearchField extends LitElement {
  static properties = {
    value: { type: String },
    inputId: { type: String, attribute: "input-id" },
    name: { type: String },
    placeholder: { type: String },
    disabled: { type: Boolean, reflect: true },
    pending: { type: Boolean, reflect: true },
  };

  static styles = [
    murgaThemeStyles,
    murgaInputSurfaceStyles,
    murgaButtonStyles,
    css`
      .root {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: var(--space-sm);
        border: 1px solid var(--border-visible);
        border-radius: 8px;
        padding-inline: 12px;
      }

      input {
        border: 0;
        padding-inline: 0;
      }

      button {
        min-block-size: auto;
        border: 0;
        padding: 0;
      }

      .icon {
        color: var(--text-secondary);
        font-family: "Space Mono", "JetBrains Mono", "SF Mono", monospace;
        font-size: var(--caption);
      }
    `,
  ];

  value = "";

  inputId?: string;

  name?: string;

  placeholder = "[SEARCH]";

  disabled = false;

  pending = false;

  updated() {
    const inputElement = this.#getInput();
    if (inputElement) {
      syncAriaAttributes(this, inputElement);
    }
  }

  #getInput() {
    return this.renderRoot.querySelector("input");
  }

  #handleInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    dispatchMcEvent(this, "mc-input", { value: target.value });
  }

  #handleChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    dispatchMcEvent(this, "mc-change", { value: target.value });
  }

  #handleClear() {
    dispatchMcEvent(this, "mc-clear", { value: "" });
  }

  render() {
    return html`
      <div class="root" part="root">
        <span class="icon" part="icon">${this.pending ? "[LOADING]" : "[SEARCH]"}</span>
        <input
          part="input"
          id=${ifDefined(this.inputId)}
          name=${ifDefined(this.name)}
          type="search"
          .value=${this.value}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          @input=${this.#handleInput}
          @change=${this.#handleChange}
        />
        <button
          part="clear-button"
          type="button"
          ?disabled=${this.disabled || this.value.length === 0}
          @click=${this.#handleClear}
        >
          [CLEAR]
        </button>
      </div>
    `;
  }
}

export function defineMcSearchField() {
  if (!customElements.get(MC_SEARCH_FIELD_TAG_NAME)) {
    customElements.define(MC_SEARCH_FIELD_TAG_NAME, McSearchField);
  }
}

export type McSearchFieldArgs = Partial<
  Pick<McSearchField, "value" | "inputId" | "name" | "placeholder" | "disabled" | "pending">
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-search-field": McSearchField;
  }
}
