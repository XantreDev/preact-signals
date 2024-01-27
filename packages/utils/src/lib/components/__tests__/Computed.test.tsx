import { signal } from "@preact-signals/unified-signals";
import React from "react";
import { describe, vi } from "vitest";
import { itRenderer } from "../../../__tests__/utils";
import { Computed } from "../components/Computed";

describe.concurrent("Computed()", () => {
  itRenderer("should render", async ({ expect, reactRoot, root }) => {
    await reactRoot().render(<Computed>{() => 10}</Computed>);

    const content = root.firstChild;
    expect(content).is.instanceOf(Text);
    expect(content).has.property("data", "10");
  });

  itRenderer("should be reactive", async ({ expect, act, reactRoot, root }) => {
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
