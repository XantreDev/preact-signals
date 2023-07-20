import { signal } from "@preact/signals-react";
import { describe, expect, it, vi } from "vitest";
import { Computed } from "../components/Computed";
import { createRenderer, sleep } from "./utils";

describe("Computed()", () => {
  const { reactRoot, root } = createRenderer();

  it("should render", async () => {
    reactRoot().render(<Computed>{() => 10}</Computed>);
    await sleep(0);

    const content = root.firstChild;
    expect(content).is.instanceOf(Text);
    expect(content).has.property("data", "10");
  });

  it("should be reactive", async () => {
    const multiplier = signal(1);
    const compFn = vi.fn(() => 10 * multiplier.value);
    reactRoot().render(<Computed>{compFn}</Computed>);
    await sleep(0);

    const content = root.firstChild;
    expect(content).is.instanceOf(Text);
    expect(content).has.property("data", "10");
    expect(compFn).toHaveBeenCalledTimes(1);
    multiplier.value = 2;
    await sleep(0);

    expect(content).is.instanceOf(Text);
    expect(compFn).toHaveBeenCalledTimes(2);
    expect(content).has.property("data", "20");
  });
});
