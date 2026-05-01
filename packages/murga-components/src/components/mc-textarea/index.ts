import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import componentStylesText from "./styles.css?inline";

import { ifDefined } from "lit/directives/if-defined.js";
import { createComponentStyles } from "../../internal/component-styles";

import { syncAriaAttributes, syncAttribute } from "../../internal/attributes";
import { dispatchMcEvent } from "../../internal/events";
import { murgaInputSurfaceStyles, murgaThemeStyles } from "../../internal/styles";

export const MC_TEXTAREA_TAG_NAME = "mc-textarea";
export const TAG_NAME = MC_TEXTAREA_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

@customElement(MC_TEXTAREA_TAG_NAME)
export class McTextarea extends LitElement {
  static styles = [murgaThemeStyles, murgaInputSurfaceStyles, componentStyles];

  @property({ type: String })
  value = "";

  @property({ type: String, attribute: "input-id" })
  inputId?: string;

  @property({ type: String })
  name?: string;

  @property({ type: Number })
  rows = 5;

  @property({ type: String })
  placeholder?: string;

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

  @query("textarea")
  private readonly textareaElement?: HTMLTextAreaElement;

  updated() {
    if (!this.textareaElement) {
      return;
    }

    syncAriaAttributes(this, this.textareaElement);
    syncAttribute(this.textareaElement, "aria-invalid", this.invalid ? "true" : null);
    syncAttribute(this.textareaElement, "aria-label", this.ariaLabel);
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
        .value=${this.value}
        placeholder=${ifDefined(this.placeholder)}
        maxlength=${ifDefined(this.maxlength)}
        ?disabled=${this.disabled}
        ?required=${this.required}
        ?readonly=${this.readonly}
        @input=${this.#handleInput}
        @change=${this.#handleChange}
      ></textarea>
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
