import { LitElement, type PropertyValues, html, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
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

@customElement(MC_SIDEBAR_NAV_TAG_NAME)
export class McSidebarNav extends LitElement {
  static styles = [murgaThemeStyles, murgaLabelStyles, murgaMetaStyles, componentStyles];

  @property({ type: String, attribute: "aria-label" })
  ariaLabel = "Main navigation";

  @property({ attribute: false })
  items: McNavItem[] = [];

  @property({ attribute: false })
  secondaryItems: McNavItem[] = [];

  @property({ attribute: false })
  footerItems: McNavItem[] = [];

  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: String })
  title = "";

  @property({ type: String })
  subtitle?: string;

  @query(".panel")
  private readonly panelElement?: HTMLElement;

  #releaseFocusTrap: (() => void) | null = null;

  disconnectedCallback() {
    this.#releaseFocusTrap?.();
    this.#releaseFocusTrap = null;
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("open")) {
      this.#syncFocusTrap();
    }
  }

  #syncFocusTrap() {
    this.#releaseFocusTrap?.();
    this.#releaseFocusTrap = null;

    if (!this.open) {
      return;
    }

    if (!this.panelElement) {
      return;
    }

    this.#releaseFocusTrap = createFocusTrap(this.panelElement, {
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
          aria-current=${item.current ? "page" : nothing}
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
            : nothing
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
