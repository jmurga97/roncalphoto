import { LitElement, html, nothing } from "lit";
import componentStylesText from "./styles.css?inline";

import { repeat } from "lit/directives/repeat.js";
import { createComponentStyles } from "../../internal/component-styles";

import type { McNavItem } from "../../internal/contracts";
import { dispatchMcEvent } from "../../internal/events";
import { createFocusTrap } from "../../internal/focus";
import { murgaLabelStyles, murgaMetaStyles, murgaThemeStyles } from "../../internal/styles";

export const MC_SIDEBAR_NAV_TAG_NAME = "mc-sidebar-nav";
export const TAG_NAME = MC_SIDEBAR_NAV_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

export class McSidebarNav extends LitElement {
  static properties = {
    ariaLabel: { type: String, attribute: "aria-label" },
    footerItems: { attribute: false },
    items: { attribute: false },
    secondaryItems: { attribute: false },
    open: { type: Boolean, reflect: true },
    title: { type: String },
    subtitle: { type: String },
  };

  static styles = [murgaThemeStyles, murgaLabelStyles, murgaMetaStyles, componentStyles];

  ariaLabel = "Main navigation";

  items: McNavItem[] = [];

  secondaryItems: McNavItem[] = [];

  footerItems: McNavItem[] = [];

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

  #renderItems(items: McNavItem[], variant: "navigation" | "footer" = "navigation") {
    return repeat(
      items,
      (item) => item.id,
      (item) => html`
        <button
          class="item"
          part="item"
          data-variant=${variant}
          type="button"
          data-current=${item.current ? "true" : "false"}
          @click=${() => this.#handleSelect(item.id)}
        >
          <span class="item-content">
            <span>${item.label}</span>
            ${item.description ? html`<span class="item-description">${item.description}</span>` : nothing}
          </span>
          ${item.count !== undefined ? html`<span>${item.count}</span>` : nothing}
        </button>
      `,
    );
  }

  render() {
    const items = this.items ?? [];
    const secondaryItems = this.secondaryItems ?? [];
    const footerItems = this.footerItems ?? [];

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
          <header class="header" part="header">
            <slot name="header">
              ${
                this.title || this.subtitle
                  ? html`
                  <div class="heading">
                    ${this.title ? html`<div>${this.title}</div>` : nothing}
                    ${this.subtitle ? html`<div class="subtitle">${this.subtitle}</div>` : nothing}
                  </div>
                `
                  : nothing
              }
            </slot>
          </header>
          <nav class="navigation" part="navigation" aria-label=${this.ariaLabel}>
            <slot name="navigation">
              <div class="section" part="section">${this.#renderItems(items)}</div>
              ${
                secondaryItems.length > 0
                  ? html`<div class="section" part="section">${this.#renderItems(secondaryItems)}</div>`
                  : nothing
              }
            </slot>
          </nav>
          <footer class="footer" part="footer">
            ${
              footerItems.length > 0
                ? html`<div class="footer-actions">${this.#renderItems(footerItems, "footer")}</div>`
                : nothing
            }
            <slot name="footer"></slot>
          </footer>
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
  Pick<
    McSidebarNav,
    "ariaLabel" | "footerItems" | "items" | "secondaryItems" | "open" | "title" | "subtitle"
  >
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-sidebar-nav": McSidebarNav;
  }
}
