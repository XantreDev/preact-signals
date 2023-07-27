import { signal } from "@preact/signals-react";
import { SpyInstance, describe, expect, it, vi } from "vitest";
import { createRenderer } from "../../__tests__/utils";
import { For } from "../components/For";

describe("For()", () => {
  const { root, reactRoot, act } = createRenderer();
  const itemAndIndexToString = (item: number, index: number) =>
    [item, index].join(".");
  it("should render correctly", async () => {
    const arr = [1, 2, 3];

    const A = vi.fn(() => <For each={() => arr}>{itemAndIndexToString}</For>);

    await reactRoot().render(<A />);
    expect(A).toHaveBeenCalledOnce();

    const expectCorrect = () =>
      [...root.children].forEach((child, index) => {
        expect(child).is.instanceOf(Text);
        expect(child).has.property(
          "data",
          itemAndIndexToString(arr[index]!, index)
        );
      });
    expectCorrect();
  });

  it("should be reactive", async () => {
    const arr = signal([1, 2, 3]);

    const A = vi.fn(() => <For each={arr}>{(item) => item * 2}</For>);

    await reactRoot().render(<A />);
    expect(A).toHaveBeenCalledOnce();

    const expectCorrect = () =>
      [...root.children].forEach((child, index) => {
        expect(child).is.instanceOf(Text);
        expect(child).has.property(
          "data",
          itemAndIndexToString(arr.peek()[index]!, index)
        );
      });
    expectCorrect();

    await act(() => {
      arr.value = [4, 5, 6];
    });

    expectCorrect();
    expect(A).toHaveBeenCalledOnce();
  });

  it("should add keys implicitly for strings and number arrays", async () => {
    const SpyFor = vi.fn(For);

    const error = vi.spyOn(console, "error");
    // const log = vi.fn();
    // const originalConsole = Object.assign({}, console);
    await reactRoot().render(<>{[<>1</>, 2]}</>);
    const hasKeyWarning = (fn: SpyInstance<unknown[], unknown>) =>
      fn.mock.calls.some((args) =>
        args
          .join("")
          .includes('Each child in a list should have a unique "key"')
      );

    expect(hasKeyWarning(error)).toBeTruthy();
    error.mockClear();

    {
      const arr = [1, 2, 3];
      const A = () => (
        <SpyFor each={() => arr}>{(item: number) => item * 2}</SpyFor>
      );

      await reactRoot().render(<A />);

      expect(SpyFor).toHaveBeenCalledOnce();
      expect(hasKeyWarning(error)).toBeFalsy();
    }
    {
      const arr = [{ v: 5 }, { v: 2 }, { v: 3 }];
      const A = () => (
        <SpyFor each={() => arr} keyExtractor={(v: { v: number }) => v.v}>
          {(item: { v: number }) => item.v * 2}
        </SpyFor>
      );

      await reactRoot().render(<A />);

      expect(SpyFor).toHaveBeenCalledTimes(2);
      expect(hasKeyWarning(error)).toBeFalsy();
    }
  });
});
