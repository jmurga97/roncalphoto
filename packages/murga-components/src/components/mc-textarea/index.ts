import { LitElement, html } from "lit";
import componentStylesText from "./styles.css?inline";

import { ifDefined } from "lit/directives/if-defined.js";
import { createComponentStyles } from "../../internal/component-styles";

import { syncAriaAttributes, syncAttribute } from "../../internal/attributes";
import { dispatchMcEvent } from "../../internal/events";
import { murgaInputSurfaceStyles, murgaThemeStyles } from "../../internal/styles";

export const MC_TEXTAREA_TAG_NAME = "mc-textarea";
export const TAG_NAME = MC_TEXTAREA_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

export class McTextarea extends LitElement {
  static properties = {
    value: { type: String },
    inputId: { type: String, attribute: "input-id" },
    name: { type: String },
    rows: { type: Number },
    placeholder: { type: String },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    readonly: { type: Boolean, attribute: "readonly", reflect: true },
    maxlength: { type: Number, attribute: "maxlength" },
    invalid: { type: Boolean, reflect: true },
    ariaLabel: { type: String, attribute: "aria-label" },
  };

  static styles = [murgaThemeStyles, murgaInputSurfaceStyles, componentStyles];

  value = "";

  inputId?: string;

  name?: string;

  rows = 5;

  placeholder?: string;

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
    const textareaElement = this.#getTextarea();

    if (!textareaElement) {
      return;
    }

    syncAriaAttributes(this, textareaElement);
    syncAttribute(textareaElement, "aria-invalid", this.invalid ? "true" : null);
    syncAttribute(textareaElement, "aria-label", this.ariaLabel);
  }

  #getTextarea() {
    return this.renderRoot.querySelector("textarea");
  }

  #handleInput(event: Event) {
    const target = event.currentTarget as HTMLTextAreaElement;
    dispatchMcEvent(this, "mc-input", { value: target.value });
  }

  #handleChange(event: Event) {
    const target = event.currentTarget as HTMLTextAreaElement;
    dispatchMcEvent(this, "mc-change", { value: target.value });
  }

  render() {
    return html`
      <textarea
        part="textarea"
        id=${ifDefined(this.inputId)}
        name=${ifDefined(this.name)}
        rows=${this.rows}
        placeholder=${ifDefined(this.placeholder)}
        maxlength=${ifDefined(this.maxlength)}
        ?disabled=${this.disabled}
        ?required=${this.required}
        ?readonly=${this.readonly}
        @input=${this.#handleInput}
        @change=${this.#handleChange}
      >
${this.value}</textarea
      >
    `;
  }
}

export function defineMcTextarea() {
  if (!customElements.get(MC_TEXTAREA_TAG_NAME)) {
    customElements.define(MC_TEXTAREA_TAG_NAME, McTextarea);
  }
}

export type McTextareaArgs = Partial<
  Pick<
    McTextarea,
    | "value"
    | "inputId"
    | "name"
    | "rows"
    | "placeholder"
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
    "mc-textarea": McTextarea;
  }
}
