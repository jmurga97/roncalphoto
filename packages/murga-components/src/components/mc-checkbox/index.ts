import { LitElement, html } from "lit";
import componentStylesText from "./styles.css?inline";

import { ifDefined } from "lit/directives/if-defined.js";
import { createComponentStyles } from "../../internal/component-styles";

import { syncAriaAttributes, syncAttribute } from "../../internal/attributes";
import { dispatchMcEvent } from "../../internal/events";
import { murgaThemeStyles } from "../../internal/styles";

export const MC_CHECKBOX_TAG_NAME = "mc-checkbox";
export const TAG_NAME = MC_CHECKBOX_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

export class McCheckbox extends LitElement {
  static properties = {
    checked: { type: Boolean, reflect: true },
    name: { type: String },
    value: { type: String },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    ariaLabel: { type: String, attribute: "aria-label" },
  };

  static styles = [murgaThemeStyles, componentStyles];

  checked = false;

  name?: string;

  value = "true";

  disabled = false;

  required = false;

  ariaLabel: string | null = null;

  updated() {
    const inputElement = this.#getInput();

    if (!inputElement) {
      return;
    }

    syncAriaAttributes(this, inputElement);
    syncAttribute(inputElement, "aria-label", this.ariaLabel);
  }

  #getInput() {
    return this.renderRoot.querySelector("input");
  }

  #handleChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    dispatchMcEvent(this, "mc-change", {
      checked: target.checked,
      value: target.value,
    });
  }

  render() {
    return html`
      <label>
        <input
          part="input"
          type="checkbox"
          name=${ifDefined(this.name)}
          value=${this.value}
          ?checked=${this.checked}
          ?disabled=${this.disabled}
          ?required=${this.required}
          @change=${this.#handleChange}
        />
        <span class="indicator" part="indicator">${this.checked ? "■" : ""}</span>
      </label>
    `;
  }
}

export function defineMcCheckbox() {
  if (!customElements.get(MC_CHECKBOX_TAG_NAME)) {
    customElements.define(MC_CHECKBOX_TAG_NAME, McCheckbox);
  }
}

export type McCheckboxArgs = Partial<
  Pick<McCheckbox, "checked" | "name" | "value" | "disabled" | "required" | "ariaLabel">
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-checkbox": McCheckbox;
  }
}
