import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import componentStylesText from "./styles.css?inline";

import { ifDefined } from "lit/directives/if-defined.js";
import { createComponentStyles } from "../../internal/component-styles";

import { syncAriaAttributes, syncAttribute } from "../../internal/attributes";
import { dispatchMcEvent } from "../../internal/events";
import { murgaInputSurfaceStyles, murgaThemeStyles } from "../../internal/styles";

export const MC_INPUT_TAG_NAME = "mc-input";
export const TAG_NAME = MC_INPUT_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

@customElement(MC_INPUT_TAG_NAME)
export class McInput extends LitElement {
  static styles = [murgaThemeStyles, murgaInputSurfaceStyles, componentStyles];

  @property({ type: String })
  value = "";

  @property({ type: String, attribute: "input-id" })
  inputId?: string;

  @property({ type: String })
  name?: string;

  @property({ type: String })
  type = "text";

  @property({ type: String })
  placeholder?: string;

  @property({ type: String })
  autocomplete?: string;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: Boolean, attribute: "readonly", reflect: true })
  readonly = false;

  @property({ type: Number, attribute: "maxlength" })
  maxlength?: number;

  @property({ type: Boolean, reflect: true })
  invalid = false;

  @property({ type: String, attribute: "aria-label" })
  ariaLabel: string | null = null;

  @query("input")
  private readonly inputElement?: HTMLInputElement;

  updated() {
    if (!this.inputElement) {
      return;
    }

    syncAriaAttributes(this, this.inputElement);
    syncAttribute(this.inputElement, "aria-invalid", this.invalid ? "true" : null);
    syncAttribute(this.inputElement, "aria-label", this.ariaLabel);
  }

  #handleInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    dispatchMcEvent(this, "mc-input", { value: target.value });
  }

  #handleChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    dispatchMcEvent(this, "mc-change", { value: target.value });
  }

  render() {
    return html`
      <input
        part="input"
        id=${ifDefined(this.inputId)}
        name=${ifDefined(this.name)}
        type=${this.type}
        .value=${this.value}
        placeholder=${ifDefined(this.placeholder)}
        autocomplete=${ifDefined(this.autocomplete)}
        maxlength=${ifDefined(this.maxlength)}
        ?disabled=${this.disabled}
        ?required=${this.required}
        ?readonly=${this.readonly}
        @input=${this.#handleInput}
        @change=${this.#handleChange}
      />
    `;
  }
}

export function defineMcInput() {
  if (!customElements.get(MC_INPUT_TAG_NAME)) {
    customElements.define(MC_INPUT_TAG_NAME, McInput);
  }
}

export type McInputArgs = Partial<
  Pick<
    McInput,
    | "value"
    | "inputId"
    | "name"
    | "type"
    | "placeholder"
    | "autocomplete"
    | "disabled"
    | "required"
    | "readonly"
    | "maxlength"
    | "invalid"
    | "ariaLabel"
  >
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-input": McInput;
  }
}
