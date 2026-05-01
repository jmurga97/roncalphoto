import { LitElement, html } from "lit";
import componentStylesText from "./styles.css?inline";

import { ifDefined } from "lit/directives/if-defined.js";
import { createComponentStyles } from "../../internal/component-styles";

import { syncAriaAttributes } from "../../internal/attributes";
import { dispatchMcEvent } from "../../internal/events";
import {
  murgaButtonStyles,
  murgaInputSurfaceStyles,
  murgaThemeStyles,
} from "../../internal/styles";

export const MC_SEARCH_FIELD_TAG_NAME = "mc-search-field";
export const TAG_NAME = MC_SEARCH_FIELD_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

export class McSearchField extends LitElement {
  static properties = {
    value: { type: String },
    inputId: { type: String, attribute: "input-id" },
    name: { type: String },
    placeholder: { type: String },
    disabled: { type: Boolean, reflect: true },
    pending: { type: Boolean, reflect: true },
  };

  static styles = [murgaThemeStyles, murgaInputSurfaceStyles, murgaButtonStyles, componentStyles];

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
