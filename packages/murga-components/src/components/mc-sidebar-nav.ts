import { LitElement, css, html, nothing } from "lit";
import { repeat } from "lit/directives/repeat.js";

import type { McNavItem } from "../internal/contracts";
import { dispatchMcEvent } from "../internal/events";
import { createFocusTrap } from "../internal/focus";
import { murgaLabelStyles, murgaMetaStyles, murgaThemeStyles } from "../internal/styles";

export const MC_SIDEBAR_NAV_TAG_NAME = "mc-sidebar-nav";
export const TAG_NAME = MC_SIDEBAR_NAV_TAG_NAME;

export class McSidebarNav extends LitElement {
  static properties = {
    items: { attribute: false },
    secondaryItems: { attribute: false },
    open: { type: Boolean, reflect: true },
    title: { type: String },
    subtitle: { type: String },
  };

  static styles = [
    murgaThemeStyles,
    murgaLabelStyles,
    murgaMetaStyles,
    css`
      :host {
        display: block;
      }

      .root {
        position: relative;
      }

      .overlay {
        position: fixed;
        inset: 0;
        z-index: 10;
        border: 0;
        background: rgba(0, 0, 0, 0.8);
      }

      .panel {
        position: relative;
        z-index: 20;
        display: grid;
        gap: var(--space-lg);
        inline-size: min(320px, 90vw);
        min-block-size: 100dvh;
        padding: var(--space-lg) var(--space-md);
        background: var(--surface);
        border-inline-end: 1px solid var(--border-visible);
      }

      .section {
        display: grid;
        gap: var(--space-xs);
      }

      .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-sm);
        border: 0;
        border-bottom: 1px solid var(--border);
        background: transparent;
        min-block-size: 44px;
        padding: 12px 0;
        color: var(--text-secondary);
        text-align: left;
      }

      .item[data-current="true"] {
        color: var(--text-display);
      }

      .heading {
        display: grid;
        gap: var(--space-xs);
      }

      .subtitle {
        color: var(--text-secondary);
      }
    `,
  ];

  items: McNavItem[] = [];

  secondaryItems: McNavItem[] = [];

  open = false;

  title = "";

  subtitle?: string;

  #releaseFocusTrap: (() => void) | null = null;

  disconnectedCallback() {
    this.#releaseFocusTrap?.();
    this.#releaseFocusTrap = null;
    super.disconnectedCallback();
  }

  updated() {
    this.#syncFocusTrap();
  }

  #syncFocusTrap() {
    this.#releaseFocusTrap?.();
    this.#releaseFocusTrap = null;

    if (!this.open) {
      return;
    }

    const panelElement = this.renderRoot.querySelector<HTMLElement>(".panel");

    if (!panelElement) {
      return;
    }

    this.#releaseFocusTrap = createFocusTrap(panelElement, {
      onEscape: () => {
        dispatchMcEvent(this, "mc-open-change", { open: false });
      },
    });
  }

  #handleOverlayClick() {
    dispatchMcEvent(this, "mc-open-change", { open: false });
  }

  #handleSelect(itemId: string) {
    dispatchMcEvent(this, "mc-select", { selectedId: itemId });
  }

  #renderItems(items: McNavItem[]) {
    return repeat(
      items,
      (item) => item.id,
      (item) => html`
        <button
          class="item"
          part="item"
          type="button"
          data-current=${item.current ? "true" : "false"}
          @click=${() => this.#handleSelect(item.id)}
        >
          <span>${item.label}</span>
          ${item.count !== undefined ? html`<span>${item.count}</span>` : nothing}
        </button>
      `,
    );
  }

  render() {
    return html`
      <div class="root" part="root">
        ${
          this.open
            ? html`
              <button
                class="overlay"
                part="overlay"
                type="button"
                aria-label="Close navigation"
                @click=${this.#handleOverlayClick}
              ></button>
            `
            : null
        }
        <aside class="panel" part="panel">
          <slot name="header"></slot>
          ${
            this.title || this.subtitle
              ? html`
                <div class="heading">
                  ${this.title ? html`<div>${this.title}</div>` : nothing}
                  ${this.subtitle ? html`<div class="subtitle">${this.subtitle}</div>` : nothing}
                </div>
              `
              : null
          }
          <nav class="section" part="section">${this.#renderItems(this.items)}</nav>
          ${
            this.secondaryItems.length > 0
              ? html`<nav class="section" part="section">${this.#renderItems(this.secondaryItems)}</nav>`
              : null
          }
          <slot name="footer"></slot>
        </aside>
      </div>
    `;
  }
}

export function defineMcSidebarNav() {
  if (!customElements.get(MC_SIDEBAR_NAV_TAG_NAME)) {
    customElements.define(MC_SIDEBAR_NAV_TAG_NAME, McSidebarNav);
  }
}

export type McSidebarNavArgs = Partial<
  Pick<McSidebarNav, "items" | "secondaryItems" | "open" | "title" | "subtitle">
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-sidebar-nav": McSidebarNav;
  }
}
