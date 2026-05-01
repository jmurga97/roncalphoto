import { LitElement, html } from "lit";
import componentStylesText from "./styles.css?inline";

import { repeat } from "lit/directives/repeat.js";
import { createComponentStyles } from "../../internal/component-styles";

import type { McTableColumn, McTableRow } from "../../internal/contracts";
import { dispatchMcEvent } from "../../internal/events";
import { murgaLabelStyles, murgaMetaStyles, murgaThemeStyles } from "../../internal/styles";

export const MC_RESOURCE_TABLE_TAG_NAME = "mc-resource-table";
export const TAG_NAME = MC_RESOURCE_TABLE_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

export class McResourceTable extends LitElement {
  static properties = {
    columns: { attribute: false },
    rows: { attribute: false },
    selectedId: { type: String, attribute: "selected-id" },
    loading: { type: Boolean, reflect: true },
    emptyLabel: { type: String, attribute: "empty-label" },
  };

  static styles = [murgaThemeStyles, murgaLabelStyles, murgaMetaStyles, componentStyles];

  columns: McTableColumn[] = [];

  rows: McTableRow[] = [];

  selectedId?: string;

  loading = false;

  emptyLabel = "No rows available";

  #handleSort(columnId: string) {
    dispatchMcEvent(this, "mc-sort", { columnId });
  }

  #handleRowSelect(rowId: string) {
    dispatchMcEvent(this, "mc-row-select", { selectedId: rowId });
  }

  #handleRowKeyDown(event: KeyboardEvent, rowId: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.#handleRowSelect(rowId);
    }
  }

  render() {
    if (this.loading) {
      return html`
        <div class="root" part="root">
          <div class="loading">[LOADING]</div>
        </div>
      `;
    }

    if (this.rows.length === 0) {
      return html`
        <div class="root" part="root">
          <div class="empty">
            <slot name="empty">${this.emptyLabel}</slot>
          </div>
        </div>
      `;
    }

    return html`
      <div class="root" part="root">
        <table part="table">
          <thead part="head">
            <tr>
              ${repeat(
                this.columns,
                (column) => column.id,
                (column) => html`
                  <th style=${column.width ? `width: ${column.width};` : ""}>
                    ${
                      column.sortable
                        ? html`
                          <button
                            class="sort-button"
                            type="button"
                            @click=${() => this.#handleSort(column.id)}
                          >
                            ${column.label}
                          </button>
                        `
                        : column.label
                    }
                  </th>
                `,
              )}
            </tr>
          </thead>
          <tbody part="body">
            ${repeat(
              this.rows,
              (row) => row.id,
              (row) => {
                const isSelected = this.selectedId === row.id || row.selected;

                return html`
                  <tr
                    part="row"
                    data-selected=${isSelected ? "true" : "false"}
                    tabindex="0"
                    @click=${() => this.#handleRowSelect(row.id)}
                    @keydown=${(event: KeyboardEvent) => this.#handleRowKeyDown(event, row.id)}
                  >
                    ${repeat(
                      this.columns,
                      (column) => column.id,
                      (column) => html`
                        <td
                          part="cell"
                          style=${column.align ? `text-align: ${column.align};` : ""}
                        >
                          ${row.cells[column.id] ?? ""}
                        </td>
                      `,
                    )}
                  </tr>
                `;
              },
            )}
          </tbody>
        </table>
      </div>
    `;
  }
}

export function defineMcResourceTable() {
  if (!customElements.get(MC_RESOURCE_TABLE_TAG_NAME)) {
    customElements.define(MC_RESOURCE_TABLE_TAG_NAME, McResourceTable);
  }
}

export type McResourceTableArgs = Partial<
  Pick<McResourceTable, "columns" | "rows" | "selectedId" | "loading" | "emptyLabel">
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-resource-table": McResourceTable;
  }
}
