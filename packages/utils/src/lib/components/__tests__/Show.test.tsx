import { signal } from "@preact-signals/unified-signals";
import React from "react";
import { describe, vi } from "vitest";
import { itRenderer } from "../../../__tests__/utils";
import { Show } from "../components";

describe.concurrent("Show()", () => {
  itRenderer(
    "should render children when truthy",
    async ({ expect, reactRoot, root }) => {
      await reactRoot().render(
        <Show when={() => true}>
          <div>1</div>
        </Show>
      );

      const content = root.firstChild;
      expect(content).is.instanceOf(HTMLDivElement);
      expect(content).has.property("textContent", "1");
    }
  );

  itRenderer(
    "should render fallback when falsy",
    async ({ expect, root, reactRoot }) => {
      await reactRoot().render(
        <Show fallback="2" when={() => false}>
          <div>1</div>
        </Show>
      );

      const content = root.firstChild;
      expect(content).is.instanceOf(Text);
      expect(content).has.property("textContent", "2");
    }
  );

  for (const checkSignals of [true, false]) {
    itRenderer(
      `should be reactive (${checkSignals ? "signals" : "callback"})`,
      async ({ reactRoot, root, expect, act }) => {
        const sig = signal(true);
        await reactRoot().render(
          <Show fallback="2" when={checkSignals ? sig : () => sig.value}>
            <div>1</div>
          </Show>
        );

        {
          const content = root.firstChild;
          expect(content).is.instanceOf(HTMLDivElement);
          expect(content).has.property("textContent", "1");
        }

        await act(() => {
          sig.value = false;
        });

        {
          const content = root.firstChild;
          expect(content).is.instanceOf(Text);
          expect(content).has.property("textContent", "2");
        }
      }
    );
  }

  itRenderer(
    "should pass truthy value to children",
    async ({ act, expect, reactRoot, root }) => {
      const sig = signal(true);
      const renderFn = vi.fn((value: unknown) => (
        <div>{value!.toString()}</div>
      ));

      await reactRoot().render(<Show when={() => sig.value}>{renderFn}</Show>);

      expect(renderFn).toHaveBeenCalledOnce();
      expect(renderFn).toHaveBeenCalledWith(true);

      const content = root.firstChild;
      expect(content).is.instanceOf(HTMLDivElement);
      expect(content).has.property("textContent", "true");

      await act(() => {
        sig.value = false;
      });

      expect(renderFn).toHaveBeenCalledOnce();
      expect(renderFn).not.toHaveBeenCalledWith(false);
    }
  );
});
