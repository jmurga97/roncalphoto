import { QueryClient, QueryClientProvider, useSuspenseQuery } from "@tanstack/react-query";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { SuspenseWrapper } from "../src";

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

async function waitForText(container: HTMLElement, text: string) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await act(async () => {
      await flushMicrotasks();
    });

    if (container.textContent?.includes(text)) {
      return;
    }
  }

  throw new Error(`Timed out waiting for "${text}"`);
}

function MaybeThrow({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Expected render error");
  }

  return <div>Rendered content</div>;
}

describe("SuspenseWrapper", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("resets the error boundary when resetKey changes", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    try {
      await act(async () => {
        root.render(
          <SuspenseWrapper
            errorFallback={<div>Render error</div>}
            fallback={<div>Loading</div>}
            resetKey="first"
          >
            <MaybeThrow shouldThrow />
          </SuspenseWrapper>,
        );
      });

      expect(container.textContent).toContain("Render error");

      await act(async () => {
        root.render(
          <SuspenseWrapper
            errorFallback={<div>Render error</div>}
            fallback={<div>Loading</div>}
            resetKey="second"
          >
            <MaybeThrow shouldThrow={false} />
          </SuspenseWrapper>,
        );
      });

      expect(container.textContent).toContain("Rendered content");
    } finally {
      consoleErrorSpy.mockRestore();
      await act(async () => {
        root.unmount();
      });
    }
  });

  it("renders with QueryErrorResetBoundary and retries after a reset", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    let shouldFail = true;

    function QueryConsumer() {
      const { data } = useSuspenseQuery({
        queryKey: ["ui", "suspense-wrapper"],
        queryFn: async () => {
          await Promise.resolve();

          if (shouldFail) {
            throw new Error("Expected query error");
          }

          return "Loaded query content";
        },
      });

      return <div>{data}</div>;
    }

    try {
      await act(async () => {
        root.render(
          <QueryClientProvider client={queryClient}>
            <SuspenseWrapper
              errorFallback={<div>Query error</div>}
              fallback={<div>Loading</div>}
              resetKey="query:first"
            >
              <QueryConsumer />
            </SuspenseWrapper>
          </QueryClientProvider>,
        );
      });

      await waitForText(container, "Query error");

      shouldFail = false;

      await act(async () => {
        root.render(
          <QueryClientProvider client={queryClient}>
            <SuspenseWrapper
              errorFallback={<div>Query error</div>}
              fallback={<div>Loading</div>}
              resetKey="query:second"
            >
              <QueryConsumer />
            </SuspenseWrapper>
          </QueryClientProvider>,
        );
      });

      await waitForText(container, "Loaded query content");
    } finally {
      consoleErrorSpy.mockRestore();
      queryClient.clear();
      await act(async () => {
        root.unmount();
      });
    }
  });
});
