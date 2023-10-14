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
    await reactRoot().render($(() => sig.value));

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
    await act(() => {
      sig.value = 20;
    });

    {
      const content = root.firstChild;
      expect(content).is.instanceOf(Text);
      expect(content).has.property("data", "20");
    }

    await act(() => {
      sig.value = 30;
    });

    {
      const content = root.firstChild;
      expect(content).is.instanceOf(Text);
      expect(content).has.property("data", "30");
    }
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
  it("should support .toJSON()", () => {
    const s = $(() => 123);
    expect(s.toJSON()).equal(123);
  });

  it("should support JSON.Stringify()", () => {
    const s = $(() => 123);
    expect(JSON.stringify({ s })).equal(JSON.stringify({ s: 123 }));
  });

  it("should support .subscribe()", () => {
    const sig = signal(123);
    const s = $(() => sig.value);
    let value: number | undefined;
    const dispose = s.subscribe((v) => (value = v));
    expect(value).equal(123);
    sig.value = 456;
    expect(value).equal(456);
    dispose();
    sig.value = 789;
    expect(value).equal(456);
  });
});
