import { LitElement, css, html, nothing } from "lit";

import type { McStatusTone } from "../internal/contracts";
import { murgaMetaStyles, murgaPanelStyles, murgaThemeStyles } from "../internal/styles";

export const MC_INLINE_MESSAGE_TAG_NAME = "mc-inline-message";
export const TAG_NAME = MC_INLINE_MESSAGE_TAG_NAME;

export class McInlineMessage extends LitElement {
  static properties = {
    tone: { type: String, reflect: true },
    title: { type: String },
    message: { type: String },
  };

  static styles = [
    murgaThemeStyles,
    murgaMetaStyles,
    murgaPanelStyles,
    css`
      .root {
        display: grid;
        gap: var(--space-xs);
        padding: var(--space-md);
      }

      .title {
        color: var(--text-display);
      }

      .body {
        color: var(--text-secondary);
      }

      :host([tone="success"]) .title {
        color: var(--success);
      }

      :host([tone="error"]) .title {
        color: var(--accent);
      }

      :host([tone="loading"]) .title {
        color: var(--warning);
      }
    `,
  ];

  tone: McStatusTone = "idle";

  title = "";

  message = "";

  render() {
    return html`
      <div class="root" part="root">
        ${this.title ? html`<div class="title" part="title">${this.title}</div>` : nothing}
        ${this.message ? html`<div class="body" part="body">${this.message}</div>` : nothing}
      </div>
    `;
  }
}

export function defineMcInlineMessage() {
  if (!customElements.get(MC_INLINE_MESSAGE_TAG_NAME)) {
    customElements.define(MC_INLINE_MESSAGE_TAG_NAME, McInlineMessage);
  }
}

export type McInlineMessageArgs = Partial<Pick<McInlineMessage, "tone" | "title" | "message">>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-inline-message": McInlineMessage;
  }
}
