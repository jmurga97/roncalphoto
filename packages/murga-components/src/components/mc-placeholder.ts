import { LitElement, css, html } from "lit";

export class McPlaceholder extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: 1px dashed currentColor;
      border-radius: 0.75rem;
      padding: 1rem;
      font: inherit;
      color: inherit;
    }
  `;

  render() {
    return html`
      <slot>
        <p>
          <strong>mc-placeholder</strong>
          scaffold base para futuros componentes de <code>@murga/components</code>.
        </p>
      </slot>
    `;
  }
}

export function defineMcPlaceholder() {
  if (!customElements.get("mc-placeholder")) {
    customElements.define("mc-placeholder", McPlaceholder);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mc-placeholder": McPlaceholder;
  }
}
