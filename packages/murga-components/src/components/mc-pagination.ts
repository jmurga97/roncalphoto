import { LitElement, css, html } from "lit";

import { dispatchMcEvent } from "../internal/events";
import { murgaButtonStyles, murgaMetaStyles, murgaThemeStyles } from "../internal/styles";

export const MC_PAGINATION_TAG_NAME = "mc-pagination";
export const TAG_NAME = MC_PAGINATION_TAG_NAME;

export class McPagination extends LitElement {
  static properties = {
    page: { type: Number },
    pageSize: { type: Number, attribute: "page-size" },
    total: { type: Number },
    hasMore: { type: Boolean, attribute: "has-more" },
    disabled: { type: Boolean, reflect: true },
  };

  static styles = [
    murgaThemeStyles,
    murgaButtonStyles,
    murgaMetaStyles,
    css`
      .root {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .meta {
        color: var(--text-secondary);
      }
    `,
  ];

  page = 1;

  pageSize = 20;

  total = 0;

  hasMore = false;

  disabled = false;

  #getTotalPages() {
    return this.total > 0 && this.pageSize > 0 ? Math.ceil(this.total / this.pageSize) : 0;
  }

  #handlePageChange(nextPage: number) {
    dispatchMcEvent(this, "mc-page-change", { page: nextPage });
  }

  render() {
    const totalPages = this.#getTotalPages();
    const disablePrevious = this.disabled || this.page <= 1;
    const disableNext =
      this.disabled ||
      (!this.hasMore && totalPages > 0 && this.page >= totalPages) ||
      (!this.hasMore && totalPages === 0);

    return html`
      <div class="root" part="root">
        <button
          part="prev-button"
          type="button"
          ?disabled=${disablePrevious}
          @click=${() => this.#handlePageChange(Math.max(1, this.page - 1))}
        >
          [PREV]
        </button>
        <span class="meta" part="meta">
          ${totalPages > 0 ? `[PAGE ${this.page} / ${totalPages}]` : `[PAGE ${this.page}]`}
        </span>
        <button
          part="next-button"
          type="button"
          ?disabled=${disableNext}
          @click=${() => this.#handlePageChange(this.page + 1)}
        >
          [NEXT]
        </button>
      </div>
    `;
  }
}

export function defineMcPagination() {
  if (!customElements.get(MC_PAGINATION_TAG_NAME)) {
    customElements.define(MC_PAGINATION_TAG_NAME, McPagination);
  }
}

export type McPaginationArgs = Partial<
  Pick<McPagination, "page" | "pageSize" | "total" | "hasMore" | "disabled">
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-pagination": McPagination;
  }
}
