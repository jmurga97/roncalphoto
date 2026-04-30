import { LitElement, css, html, nothing } from "lit";
import { repeat } from "lit/directives/repeat.js";

import type { McInlineStatus, McStatItem } from "../internal/contracts";
import {
  murgaLabelStyles,
  murgaMetaStyles,
  murgaSurfaceStyles,
  murgaThemeStyles,
} from "../internal/styles";

export const MC_OVERVIEW_PANEL_TAG_NAME = "mc-overview-panel";
export const TAG_NAME = MC_OVERVIEW_PANEL_TAG_NAME;

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
    css`
      .root {
        display: grid;
        gap: var(--space-lg);
        padding: var(--space-lg);
      }

      .header {
        display: grid;
        gap: var(--space-sm);
      }

      .title {
        font-family: "Doto", "Space Mono", monospace;
        font-size: var(--display-md);
        line-height: 1.1;
        color: var(--text-display);
      }

      .description {
        color: var(--text-secondary);
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: var(--space-md);
      }

      .stat {
        display: grid;
        gap: var(--space-xs);
        padding: var(--space-md);
        border: 1px solid var(--border);
        border-radius: 12px;
        background: var(--surface-raised);
      }

      .stat-value {
        color: var(--text-display);
        font-family: "Space Mono", "JetBrains Mono", "SF Mono", monospace;
        font-size: var(--subheading);
      }

      .status {
        color: var(--text-secondary);
      }
    `,
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
