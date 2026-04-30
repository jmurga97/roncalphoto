export async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

export async function appendAndFlush<
  TElement extends HTMLElement & { updateComplete?: Promise<unknown> },
>(element: TElement) {
  document.body.append(element);
  await element.updateComplete;
  await flushMicrotasks();
  return element;
}
