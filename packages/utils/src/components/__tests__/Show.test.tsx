import { signal } from "@preact/signals-react";
import { describe, expect, it, vi } from "vitest";
import { createRenderer } from "../../__tests__/utils";
import { Show } from "../components";

describe("Show()", () => {
  const { reactRoot, root, act } = createRenderer();
  it("should render children when truthy", async () => {
    await reactRoot().render(
      <Show when={() => true}>
        <div>1</div>
      </Show>
    );

    const content = root.firstChild;
    expect(content).is.instanceOf(HTMLDivElement);
    expect(content).has.property("textContent", "1");
  });

  it("should render fallback when falsy", async () => {
    await reactRoot().render(
      <Show fallback="2" when={() => false}>
        <div>1</div>
      </Show>
    );

    const content = root.firstChild;
    expect(content).is.instanceOf(Text);
    expect(content).has.property("textContent", "2");
  });

  for (const checkSignals of [true, false]) {
    it(`should be reactive (${
      checkSignals ? "signals" : "callback"
    })`, async () => {
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
    });
  }

  it("should pass truthy value to children", async () => {
    const sig = signal(true);
    const renderFn = vi.fn((value: unknown) => <div>{value!.toString()}</div>);

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
  });
});
