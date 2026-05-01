import { LitElement, type PropertyValues, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import componentStylesText from "./styles.css?inline";

import { ifDefined } from "lit/directives/if-defined.js";
import { repeat } from "lit/directives/repeat.js";
import { createComponentStyles } from "../../internal/component-styles";

import { syncAriaAttributes, syncAttribute } from "../../internal/attributes";
import type { McOption } from "../../internal/contracts";
import { dispatchMcEvent } from "../../internal/events";
import { findItemById } from "../../internal/selection";
import {
  murgaButtonStyles,
  murgaMetaStyles,
  murgaPanelStyles,
  murgaThemeStyles,
} from "../../internal/styles";

const SELECT_LISTBOX_PREFIX = "mc-select-listbox";
let selectListboxCount = 0;

export const MC_SELECT_TAG_NAME = "mc-select";
export const TAG_NAME = MC_SELECT_TAG_NAME;

const componentStyles = createComponentStyles(componentStylesText);

@customElement(MC_SELECT_TAG_NAME)
export class McSelect extends LitElement {
  static styles = [
    murgaThemeStyles,
    murgaButtonStyles,
    murgaPanelStyles,
    murgaMetaStyles,
    componentStyles,
  ];

  @property({ attribute: false })
  options: McOption[] = [];

  @property({ type: String, attribute: "selected-id" })
  selectedId: string | null = null;

  @property({ type: String, attribute: "input-id" })
  inputId?: string;

  @property({ type: String })
  name?: string;

  @property({ type: String })
  placeholder = "[SELECT]";

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: String, attribute: "aria-label" })
  ariaLabel: string | null = null;

  @query(".trigger")
  private readonly triggerElement?: HTMLButtonElement;

  @query(".panel")
  private readonly panelElement?: HTMLElement;

  @state()
  private selectedOption: McOption | null = null;

  @state()
  private displayLabel = this.placeholder;

  readonly #listboxId = `${SELECT_LISTBOX_PREFIX}-${++selectListboxCount}`;

  protected willUpdate(changedProperties: PropertyValues<this>) {
    if (
      changedProperties.has("options") ||
      changedProperties.has("selectedId") ||
      changedProperties.has("placeholder")
    ) {
      this.selectedOption = findItemById(this.options, this.selectedId);
      this.displayLabel = this.selectedOption?.label ?? this.placeholder;
    }
  }

  protected updated(changedProperties: PropertyValues<this>) {
    if (this.triggerElement) {
      syncAriaAttributes(this, this.triggerElement);
      syncAttribute(this.triggerElement, "aria-controls", this.#listboxId);
      syncAttribute(this.triggerElement, "aria-expanded", this.open ? "true" : "false");
      syncAttribute(this.triggerElement, "aria-haspopup", "listbox");
      syncAttribute(this.triggerElement, "aria-label", this.ariaLabel);
    }

    if (changedProperties.has("open") && this.open) {
      queueMicrotask(() => {
        const selectedOption = this.panelElement?.querySelector<HTMLButtonElement>(
          '.option[aria-selected="true"]',
        );
        selectedOption?.focus();
      });
    }
  }

  #handleTriggerClick() {
    dispatchMcEvent(this, "mc-open-change", { open: !this.open });
  }

  #handleTriggerKeyDown(event: KeyboardEvent) {
    if (
      event.key === "ArrowDown" ||
      event.key === "Enter" ||
      event.key === " " ||
      event.key === "Spacebar"
    ) {
      event.preventDefault();
      dispatchMcEvent(this, "mc-open-change", { open: true });
    }
  }

  #handlePanelKeyDown(event: KeyboardEvent) {
    const optionElements = Array.from(
      this.panelElement?.querySelectorAll<HTMLButtonElement>(".option") ?? [],
    );

    if (event.key === "Escape") {
      event.preventDefault();
      dispatchMcEvent(this, "mc-open-change", { open: false });
      this.triggerElement?.focus();
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();
    const activeElement = this.shadowRoot?.activeElement ?? null;
    const currentIndex = optionElements.findIndex((element) => element === activeElement);
    const delta = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex =
      currentIndex === -1
        ? 0
        : Math.max(0, Math.min(optionElements.length - 1, currentIndex + delta));
    optionElements[nextIndex]?.focus();
  }

  #handleOptionClick(option: McOption) {
    dispatchMcEvent(this, "mc-change", { selectedId: option.id });
    dispatchMcEvent(this, "mc-open-change", { open: false });
  }

  render() {
    return html`
      <div class="field" part="field">
        <input
          type="hidden"
          id=${ifDefined(this.inputId)}
          name=${ifDefined(this.name)}
          value=${ifDefined(this.selectedId ?? undefined)}
        />
        <button
          class="trigger"
          part="trigger"
          type="button"
          ?disabled=${this.disabled}
          aria-controls=${this.#listboxId}
          aria-expanded=${this.open ? "true" : "false"}
          aria-haspopup="listbox"
          @click=${this.#handleTriggerClick}
          @keydown=${this.#handleTriggerKeyDown}
        >
          <span class=${this.selectedOption ? "value" : "value placeholder"}>${this.displayLabel}</span>
          <span>${this.open ? "[OPEN]" : "[CLOSED]"}</span>
        </button>

        ${
          this.open
            ? html`
              <div
                id=${this.#listboxId}
                class="panel"
                part="panel"
                role="listbox"
                aria-label=${this.ariaLabel ?? this.placeholder}
                @keydown=${this.#handlePanelKeyDown}
              >
                ${repeat(
                  this.options,
                  (option) => option.id,
                  (option) => html`
                    <button
                      class="option"
                      part="option"
                      type="button"
                      role="option"
                      aria-selected=${this.selectedId === option.id ? "true" : "false"}
                      ?disabled=${option.disabled}
                      @click=${() => this.#handleOptionClick(option)}
                    >
                      <span>${option.label}</span>
                      ${
                        option.description
                          ? html`<span class="description">${option.description}</span>`
                          : nothing
                      }
                    </button>
                  `,
                )}
              </div>
            `
            : nothing
        }
      </div>
    `;
  }
}

export function defineMcSelect() {
  if (!customElements.get(MC_SELECT_TAG_NAME)) {
    customElements.define(MC_SELECT_TAG_NAME, McSelect);
  }
}

export type McSelectArgs = Partial<
  Pick<
    McSelect,
    | "options"
    | "selectedId"
    | "inputId"
    | "name"
    | "placeholder"
    | "disabled"
    | "open"
    | "ariaLabel"
  >
>;

declare global {
  interface HTMLElementTagNameMap {
    "mc-select": McSelect;
  }
}
