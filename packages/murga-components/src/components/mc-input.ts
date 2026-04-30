import { LitElement, css, html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

import { syncAriaAttributes, syncAttribute } from "../internal/attributes";
import { dispatchMcEvent } from "../internal/events";
import { murgaInputSurfaceStyles, murgaThemeStyles } from "../internal/styles";

export const MC_INPUT_TAG_NAME = "mc-input";
export const TAG_NAME = MC_INPUT_TAG_NAME;

export class McInput extends LitElement {
  static properties = {
    value: { type: String },
    inputId: { type: String, attribute: "input-id" },
    name: { type: String },
    type: { type: String },
    placeholder: { type: String },
    autocomplete: { type: String },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    readonly: { type: Boolean, attribute: "readonly", reflect: true },
    maxlength: { type: Number, attribute: "maxlength" },
    invalid: { type: Boolean, reflect: true },
    ariaLabel: { type: String, attribute: "aria-label" },
  };

  static styles = [
    murgaThemeStyles,
    murgaInputSurfaceStyles,
    css`
      input {
        border-color: var(--border-visible);
      }

      :host([invalid]) input {
        border-color: var(--accent);
      }

      input[disabled] {
        opacity: 0.4;
        cursor: not-allowed;
      }
    `,
  ];

  value = "";

  inputId?: string;

  name?: string;

  type = "text";

  placeholder?: string;

  autocomplete?: string;

  disabled = false;

  required = false;

  maxlength?: number;

  invalid = false;

  ariaLabel: string | null = null;

  #readonly = false;

  get readonly() {
    return this.#readonly;
  }

  set readonly(value: boolean) {
    const nextValue = Boolean(value);
    const previousValue = this.#readonly;
    this.#readonly = nextValue;
    this.requestUpdate("readonly", previousValue);
  }

  updated() {
    const inputElement = this.#getInput();

    if (!inputElement) {
      return;
    }

    syncAriaAttributes(this, inputElement);
    syncAttribute(inputElement, "aria-invalid", this.invalid ? "true" : null);
    syncAttribute(inputElement, "aria-label", this.ariaLabel);
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
