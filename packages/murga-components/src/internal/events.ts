export function dispatchMcEvent<TDetail>(
  element: HTMLElement,
  type: `mc-${string}`,
  detail: TDetail,
) {
  return element.dispatchEvent(
    new CustomEvent<TDetail>(type, {
      bubbles: true,
      composed: true,
      detail,
    }),
  );
}
