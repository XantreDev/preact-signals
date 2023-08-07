import { computed, signal } from "@preact-signals/unified-signals";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { $ } from "../$";
import { createRenderer, sleep } from "./utils";

describe("$()", () => {
  const { reactRoot, root, act } = createRenderer();
  it("should be readable", () => {
    expect($(() => 10).value).toBe(10);
  });

  it("should be reactive", () => {
    const sig = signal(10);
    const $sig = $(() => sig.value);
    expect($sig.value).toBe(10);

    sig.value = 20;
    expect($sig.value).toBe(20);

    const c = computed(() => $sig.value + 10);
    expect(c.value).toBe(30);
    sig.value = 10;

    expect(c.value).toBe(20);
  });

  it("should render in react", async () => {
    await act(() => reactRoot().render($(() => 10)));

    const content = root.firstChild;
    expect(content).is.instanceOf(Text);
    expect(content).has.property("data", "10");
  });

  it("should be reactive while rendering", async () => {
    const sig = signal<React.ReactNode>(10);
    reactRoot().render($(() => sig.value));
    await sleep(0);

    {
      const content = root.firstChild;
      expect(content).is.instanceOf(Text);
      expect(content).has.property("data", "10");
    }
    await act(() => {
      sig.value = <div>110</div>;
    });

    {
      const content = root.firstChild!;
      expect(content).is.instanceOf(HTMLDivElement);
      expect(content.firstChild).to.have.property("textContent", "110");
    }
  });
  it("shouldn't reexecute when rerenders", async () => {
    const sig = signal(10);
    let dummy = signal(0);
    const $fn = vi.fn(() => sig.value);
    const render = vi.fn();
    const Component = () => {
      dummy.value;
      render();
      return $(() => $fn());
    };
    await act(() => reactRoot().render(<Component />));

    expect(root.firstChild).to.have.property("data", "10");
    expect($fn).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledTimes(1);

    await act(() => {
      dummy.value++;
    });

    expect(root.firstChild).to.have.property("data", "10");
    expect($fn).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledTimes(2);
  });
  it("should provide not reactive peek method", async () => {
    const sig = signal(0);
    const uncached = $(() => sig.value);
    const c = computed(() => uncached.peek() + 10);
    expect(c.value).toBe(10);

    sig.value = 20;
    expect(c.value).toBe(10);
  });

  it("should stringify correctly", () => {
    expect($(() => 10).toString()).toBe("10");
    expect($(() => "10").toString()).toBe("10");
    expect($(() => null).toString()).toBe("null");
    expect($(() => undefined).toString()).toBe("undefined");
  });

  it("should be unwrap while valueOf", () => {
    expect($(() => 10).valueOf()).toBe(10);
    expect($(() => "10").valueOf()).toBe("10");
    expect($(() => null).valueOf()).toBe(null);
    expect($(() => undefined).valueOf()).toBe(undefined);
  });
});
