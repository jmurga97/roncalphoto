import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import componentStylesText from "./styles.css?inline";

import { createComponentStyles } from "../../internal/component-styles";

import { murgaLabelStyles, murgaMetaStyles, murgaThemeStyles } from "../../internal/styles";

export const MC_FIELD_TAG_NAME = "mc-field";
export const TAG_NAME = MC_FIELD_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

@customElement(MC_FIELD_TAG_NAME)
export class McField extends LitElement {
  static styles = [murgaThemeStyles, murgaLabelStyles, murgaMetaStyles, componentStyles];

  @property({ type: String, attribute: "input-id" })
  inputId?: string;

  @property({ type: String })
  label?: string;

  @property({ type: String })
  hint?: string;

  @property({ type: String })
  error?: string;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: Boolean, reflect: true })
  optional = false;

  @property({ type: Boolean, reflect: true })
  invalid = false;

  render() {
    return html`
      ${
        this.label
          ? html`
            <label for=${this.inputId ?? nothing} part="label">
              <span>${this.label}</span>
              ${
                this.required
                  ? html`<span class="meta">[REQUIRED]</span>`
                  : this.optional
                    ? html`<span class="meta">[OPTIONAL]</span>`
                    : nothing
              }
            </label>
          `
          : nothing
      }
      <div part="content">
        <slot></slot>
      </div>
      ${
        this.error
          ? html`<div class="error" part="error">${this.error}</div>`
          : this.hint
            ? html`<div class="hint" part="hint">${this.hint}</div>`
            : nothing
      }
    `;
  }
}

export function defineMcField() {
  if (!customElements.get(MC_FIELD_TAG_NAME)) {
    customElements.define(MC_FIELD_TAG_NAME, McField);
  }
}

export type McFieldArgs = Partial<
  Pick<McField, "inputId" | "label" | "hint" | "error" | "required" | "optional" | "invalid">
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-field": McField;
  }
}
