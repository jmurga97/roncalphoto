import { LitElement, css, html, nothing } from "lit";

import { murgaLabelStyles, murgaMetaStyles, murgaThemeStyles } from "../internal/styles";

export const MC_FIELD_TAG_NAME = "mc-field";
export const TAG_NAME = MC_FIELD_TAG_NAME;

export class McField extends LitElement {
  static properties = {
    inputId: { type: String, attribute: "input-id" },
    label: { type: String },
    hint: { type: String },
    error: { type: String },
    required: { type: Boolean, reflect: true },
    optional: { type: Boolean, reflect: true },
    invalid: { type: Boolean, reflect: true },
  };

  static styles = [
    murgaThemeStyles,
    murgaLabelStyles,
    murgaMetaStyles,
    css`
      :host {
        display: grid;
        gap: var(--space-sm);
      }

      label {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        color: var(--text-secondary);
      }

      .meta {
        color: var(--text-disabled);
      }

      .hint {
        color: var(--text-secondary);
      }

      .error {
        color: var(--accent);
      }
    `,
  ];

  inputId?: string;

  label?: string;

  hint?: string;

  error?: string;

  required = false;

  optional = false;

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
