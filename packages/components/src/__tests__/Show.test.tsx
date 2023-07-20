import { signal } from "@preact/signals-core";
import { describe, expect, it, vi } from "vitest";
import { Show } from "../components";
import { createRenderer, sleep } from "./utils";

describe("Show()", () => {
  const { reactRoot, root } = createRenderer();
  it("should render children when truthy", async () => {
    reactRoot().render(
      <Show when={() => true}>
        <div>1</div>
      </Show>
    );

    await sleep(0);

    const content = root.firstChild;
    expect(content).is.instanceOf(HTMLDivElement);
    expect(content).has.property("textContent", "1");
  });

  it("should render fallback when falsy", async () => {
    reactRoot().render(
      <Show fallback="2" when={() => false}>
        <div>1</div>
      </Show>
    );

    await sleep(0);

    const content = root.firstChild;
    expect(content).is.instanceOf(Text);
    expect(content).has.property("textContent", "2");
  });

  for (const checkSignals of [true, false]) {
    it(`should be reactive (${
      checkSignals ? "signals" : "callback"
    })`, async () => {
      const sig = signal(true);
      reactRoot().render(
        <Show fallback="2" when={checkSignals ? sig : () => sig.value}>
          <div>1</div>
        </Show>
      );

      await sleep(0);
      {
        const content = root.firstChild;
        expect(content).is.instanceOf(HTMLDivElement);
        expect(content).has.property("textContent", "1");
      }

      sig.value = false;
      await sleep(0);

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

    reactRoot().render(<Show when={() => sig.value}>{renderFn}</Show>);

    await sleep(0);

    expect(renderFn).toHaveBeenCalledOnce();
    expect(renderFn).toHaveBeenCalledWith(true);

    const content = root.firstChild;
    expect(content).is.instanceOf(HTMLDivElement);
    expect(content).has.property("textContent", "true");

    sig.value = false;
    await sleep(0);

    expect(renderFn).toHaveBeenCalledOnce();
    expect(renderFn).not.toHaveBeenCalledWith(false);
  });
});
