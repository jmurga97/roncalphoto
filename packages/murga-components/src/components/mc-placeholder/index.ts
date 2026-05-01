import { LitElement, html } from "lit";
import componentStylesText from "./styles.css?inline";

import { createComponentStyles } from "../../internal/component-styles";

const componentStyles = createComponentStyles(componentStylesText);

export class McPlaceholder extends LitElement {
  static styles = componentStyles;

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
