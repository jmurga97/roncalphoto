import { LitElement, html, nothing } from "lit";
import componentStylesText from "./styles.css?inline";

import { repeat } from "lit/directives/repeat.js";
import { createComponentStyles } from "../../internal/component-styles";

import type { McInlineStatus, McStatItem } from "../../internal/contracts";
import {
  murgaLabelStyles,
  murgaMetaStyles,
  murgaSurfaceStyles,
  murgaThemeStyles,
} from "../../internal/styles";

export const MC_OVERVIEW_PANEL_TAG_NAME = "mc-overview-panel";
export const TAG_NAME = MC_OVERVIEW_PANEL_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

export class McOverviewPanel extends LitElement {
  static properties = {
    title: { type: String },
    description: { type: String },
    stats: { attribute: false },
    status: { attribute: false },
  };

  static styles = [
    murgaThemeStyles,
    murgaSurfaceStyles,
    murgaLabelStyles,
    murgaMetaStyles,
    componentStyles,
  ];

  title = "";

  description?: string;

  stats: McStatItem[] = [];

  status: McInlineStatus | null = null;

  #getStatColor(status?: McStatItem["status"]) {
    switch (status) {
      case "success":
        return "var(--success)";
      case "error":
        return "var(--accent)";
      case "loading":
        return "var(--warning)";
      default:
        return "var(--text-display)";
    }
  }

  render() {
    return html`
      <section class="root" part="root">
        <header class="header" part="header">
          <slot name="actions"></slot>
          <div class="title">${this.title}</div>
          ${this.description ? html`<div class="description">${this.description}</div>` : nothing}
          ${this.status ? html`<div class="status">${this.status.label}</div>` : nothing}
        </header>

        ${
          this.stats.length > 0
            ? html`
              <div class="stats" part="stats">
                ${repeat(
                  this.stats,
                  (item) => item.id,
                  (item) => html`
                    <article class="stat">
                      <div>${item.label}</div>
                      <div class="stat-value" style=${`color: ${this.#getStatColor(item.status)};`}>
                        ${item.value}
                      </div>
                    </article>
                  `,
                )}
              </div>
            `
            : nothing
        }

        <div part="body">
          <slot name="content"></slot>
        </div>
      </section>
    `;
  }
}

export function defineMcOverviewPanel() {
  if (!customElements.get(MC_OVERVIEW_PANEL_TAG_NAME)) {
    customElements.define(MC_OVERVIEW_PANEL_TAG_NAME, McOverviewPanel);
  }
}

export type McOverviewPanelArgs = Partial<
  Pick<McOverviewPanel, "title" | "description" | "stats" | "status">
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-overview-panel": McOverviewPanel;
  }
}
