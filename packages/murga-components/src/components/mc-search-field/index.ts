import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
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

@customElement(MC_SEARCH_FIELD_TAG_NAME)
export class McSearchField extends LitElement {
  static styles = [murgaThemeStyles, murgaInputSurfaceStyles, murgaButtonStyles, componentStyles];

  @property({ type: String })
  value = "";

  @property({ type: String, attribute: "input-id" })
  inputId?: string;

  @property({ type: String })
  name?: string;

  @property({ type: String })
  placeholder = "[SEARCH]";

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  pending = false;

  @query("input")
  private readonly inputElement?: HTMLInputElement;

  updated() {
    if (this.inputElement) {
      syncAriaAttributes(this, this.inputElement);
    }
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
          aria-label="Clear search"
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
