import { signal } from "@preact/signals-react";
import { describe, expect, it, vi } from "vitest";
import { createRenderer } from "../../__tests__/utils";
import { Computed } from "../components/Computed";

describe("Computed()", () => {
  const { reactRoot, act, root } = createRenderer();

  it("should render", async () => {
    await reactRoot().render(<Computed>{() => 10}</Computed>);

    const content = root.firstChild;
    expect(content).is.instanceOf(Text);
    expect(content).has.property("data", "10");
  });

  it("should be reactive", async () => {
    const multiplier = signal(1);
    const compFn = vi.fn(() => 10 * multiplier.value);
    await reactRoot().render(<Computed>{compFn}</Computed>);

    const content = root.firstChild;
    expect(content).is.instanceOf(Text);
    expect(content).has.property("data", "10");
    expect(compFn).toHaveBeenCalledTimes(1);

    await act(() => {
      multiplier.value = 2;
    });

    expect(content).is.instanceOf(Text);
    expect(compFn).toHaveBeenCalledTimes(2);
    expect(content).has.property("data", "20");
  });
});
