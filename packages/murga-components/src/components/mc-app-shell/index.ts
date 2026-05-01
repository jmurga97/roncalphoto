import { LitElement, html } from "lit";
import componentStylesText from "./styles.css?inline";

import { createComponentStyles } from "../../internal/component-styles";

import { dispatchMcEvent } from "../../internal/events";
import { createFocusTrap } from "../../internal/focus";
import { murgaPanelStyles, murgaThemeStyles } from "../../internal/styles";

export const MC_APP_SHELL_TAG_NAME = "mc-app-shell";
export const TAG_NAME = MC_APP_SHELL_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

export class McAppShell extends LitElement {
  static properties = {
    sidebarOpen: { type: Boolean, attribute: "sidebar-open", reflect: true },
    mobileOverlay: { type: Boolean, attribute: "mobile-overlay", reflect: true },
  };

  static styles = [murgaThemeStyles, murgaPanelStyles, componentStyles];

  sidebarOpen = false;

  mobileOverlay = true;

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

    if (!this.mobileOverlay || !this.sidebarOpen) {
      return;
    }

    const sidebarElement = this.renderRoot.querySelector<HTMLElement>(".sidebar");

    if (!sidebarElement) {
      return;
    }

    this.#releaseFocusTrap = createFocusTrap(sidebarElement, {
      onEscape: () => {
        dispatchMcEvent(this, "mc-sidebar-open-change", { open: false });
      },
    });
  }

  #handleOverlayClick() {
    dispatchMcEvent(this, "mc-sidebar-open-change", { open: false });
  }

  render() {
    const showOverlay = this.mobileOverlay && this.sidebarOpen;

    return html`
      <div class="root" part="root">
        ${
          showOverlay
            ? html`
              <button
                class="overlay"
                part="overlay"
                type="button"
                aria-label="Close sidebar"
                @click=${this.#handleOverlayClick}
              ></button>
            `
            : null
        }
        <aside class="sidebar" part="sidebar">
          <slot name="sidebar"></slot>
        </aside>
        <main class="main" part="main">
          <slot name="header"></slot>
          <slot name="main"></slot>
          <slot name="footer"></slot>
        </main>
      </div>
    `;
  }
}

export function defineMcAppShell() {
  if (!customElements.get(MC_APP_SHELL_TAG_NAME)) {
    customElements.define(MC_APP_SHELL_TAG_NAME, McAppShell);
  }
}

export type McAppShellArgs = Partial<Pick<McAppShell, "sidebarOpen" | "mobileOverlay">>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-app-shell": McAppShell;
  }
}
