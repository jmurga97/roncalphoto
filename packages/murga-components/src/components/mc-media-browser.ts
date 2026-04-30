import { LitElement, css, html, nothing } from "lit";

import type { McMediaItem } from "../internal/contracts";
import { dispatchMcEvent } from "../internal/events";
import { findItemById, resolveNextItemId } from "../internal/selection";
import { murgaMetaStyles, murgaSurfaceStyles, murgaThemeStyles } from "../internal/styles";

import "./mc-thumbnail-rail";

export const MC_MEDIA_BROWSER_TAG_NAME = "mc-media-browser";
export const TAG_NAME = MC_MEDIA_BROWSER_TAG_NAME;

export class McMediaBrowser extends LitElement {
  static properties = {
    items: { attribute: false },
    selectedId: { type: String, attribute: "selected-id" },
    showRail: { type: Boolean, attribute: "show-rail", reflect: true },
    emptyLabel: { type: String, attribute: "empty-label" },
  };

  static styles = [
    murgaThemeStyles,
    murgaSurfaceStyles,
    murgaMetaStyles,
    css`
      .root {
        display: grid;
        gap: var(--space-md);
        padding: var(--space-lg);
      }

      .viewport {
        display: grid;
        gap: var(--space-md);
      }

      .media {
        overflow: hidden;
        border-radius: 12px;
        background: var(--surface-raised);
      }

      img {
        display: block;
        inline-size: 100%;
        max-block-size: min(70vh, 720px);
        object-fit: contain;
      }

      .caption {
        color: var(--text-secondary);
      }
    `,
  ];

  items: McMediaItem[] = [];

  selectedId?: string;

  showRail = true;

  emptyLabel = "No media available";

  #handleSelect(event: Event) {
    const detail = (event as CustomEvent<{ selectedId: string }>).detail;
    dispatchMcEvent(this, "mc-select", { selectedId: detail.selectedId });
  }

  #handleKeyDown(event: KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextId = resolveNextItemId(this.items, this.selectedId, delta);

    if (!nextId) {
      return;
    }

    event.preventDefault();
    dispatchMcEvent(this, "mc-select", { selectedId: nextId });
  }

  render() {
    const selectedItem = findItemById(this.items, this.selectedId) ?? this.items[0] ?? null;

    if (!selectedItem) {
      return html`
        <div class="root" part="root">
          <div>${this.emptyLabel}</div>
        </div>
      `;
    }

    return html`
      <section class="root" part="root" tabindex="0" @keydown=${this.#handleKeyDown}>
        <div class="viewport" part="viewport">
          <div class="media" part="media">
            <img src=${selectedItem.src} alt=${selectedItem.alt} />
          </div>
          ${selectedItem.caption ? html`<div class="caption">${selectedItem.caption}</div>` : nothing}
          <slot name="meta"></slot>
        </div>
        ${
          this.showRail
            ? html`
              <mc-thumbnail-rail
                part="rail"
                .items=${this.items}
                .selectedId=${selectedItem.id}
                @mc-select=${this.#handleSelect}
              ></mc-thumbnail-rail>
            `
            : nothing
        }
      </section>
    `;
  }
}

export function defineMcMediaBrowser() {
  if (!customElements.get(MC_MEDIA_BROWSER_TAG_NAME)) {
    customElements.define(MC_MEDIA_BROWSER_TAG_NAME, McMediaBrowser);
  }
}

export type McMediaBrowserArgs = Partial<
  Pick<McMediaBrowser, "items" | "selectedId" | "showRail" | "emptyLabel">
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-media-browser": McMediaBrowser;
  }
}
