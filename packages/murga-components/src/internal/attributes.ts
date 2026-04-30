const FORWARDED_ARIA_ATTRIBUTES = [
  "aria-activedescendant",
  "aria-controls",
  "aria-describedby",
  "aria-details",
  "aria-errormessage",
  "aria-expanded",
  "aria-invalid",
  "aria-label",
  "aria-labelledby",
  "aria-live",
  "aria-owns",
  "aria-required",
  "aria-selected",
  "role",
] as const;

export function syncAttribute(
  target: Element,
  name: string,
  value: boolean | number | string | null | undefined,
) {
  if (value === false || value === null || value === undefined || value === "") {
    target.removeAttribute(name);
    return;
  }

  if (value === true) {
    target.setAttribute(name, "");
    return;
  }

  target.setAttribute(name, String(value));
}

export function syncAriaAttributes(source: HTMLElement, target: Element) {
  for (const attribute of FORWARDED_ARIA_ATTRIBUTES) {
    const value = source.getAttribute(attribute);

    if (value === null) {
      target.removeAttribute(attribute);
      continue;
    }

    target.setAttribute(attribute, value);
  }
}
