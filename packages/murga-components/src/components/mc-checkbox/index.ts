import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import componentStylesText from "./styles.css?inline";

import { ifDefined } from "lit/directives/if-defined.js";
import { createComponentStyles } from "../../internal/component-styles";

import { syncAriaAttributes, syncAttribute } from "../../internal/attributes";
import { dispatchMcEvent } from "../../internal/events";
import { murgaThemeStyles } from "../../internal/styles";

export const MC_CHECKBOX_TAG_NAME = "mc-checkbox";
export const TAG_NAME = MC_CHECKBOX_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

@customElement(MC_CHECKBOX_TAG_NAME)
export class McCheckbox extends LitElement {
  static styles = [murgaThemeStyles, componentStyles];

  @property({ type: Boolean, reflect: true })
  checked = false;

  @property({ type: String })
  name?: string;

  @property({ type: String })
  value = "true";

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: String, attribute: "aria-label" })
  ariaLabel: string | null = null;

  @query("input")
  private readonly inputElement?: HTMLInputElement;

  updated() {
    if (!this.inputElement) {
      return;
    }

    syncAriaAttributes(this, this.inputElement);
    syncAttribute(this.inputElement, "aria-label", this.ariaLabel);
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
