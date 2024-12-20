import {
  batch,
  computed,
  effect,
  untracked,
} from "@preact-signals/unified-signals";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { $ } from "../../lib";
import { Store, deepSignal } from "../../lib/store";
import { itRenderer, sleep } from "../utils";

describe("store", () => {
  it("should correctly batch events", () => {
    const store = Store.deepReactive({
      count: 0,
    });
    const fn = vi.fn(() => {
      store.count;
    });
    effect(fn);
    expect(fn).toHaveBeenCalledTimes(1);

    store.count++;
    store.count++;

    expect(fn).toHaveBeenCalledTimes(3);

    batch(() => {
      store.count++;
      store.count++;
    });
    expect(fn).toHaveBeenCalledTimes(4);
  });

  itRenderer(
    "should work with react",
    async ({ expect, reactRoot, root, act }) => {
      const store = Store.deepReactive({
        count: 0,
      });
      await reactRoot().render(<div>{$(() => store.count)}</div>);

      expect(root.innerHTML).toBe("<div>0</div>");

      await act(() => store.count++);

      expect(root.innerHTML).toBe("<div>1</div>");
    },
  );

  it("custom class tracking", () => {
    class CustomClass {
      constructor(public value: number) {}
    }
    const store = Store.deepReactive({
      count: new CustomClass(0),
    });
    const fn = vi.fn(() => {
      store.count.value;
    });
    effect(fn);
    expect(fn).toHaveBeenCalledTimes(1);

    store.count.value++;
    store.count.value++;

    expect(fn).toHaveBeenCalledTimes(3);

    batch(() => {
      store.count.value++;
      store.count.value++;
    });
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it("shouldn't go into infinite loop on set", () => {
    const state = Store.deepReactive({
      count: 0,
    });

    effect(() => {
      if (state.count < 10) {
        state.count++;
      }
    });

    expect(state.count).toBe(10);

    effect(() => {
      untracked(() => {
        state.count++;
      });
    });

    expect(state.count).toBe(11);
  });
});

describe("deepSignal", () => {
  it("should work", () => {
    const sig = deepSignal({ a: 1, b: { c: 2 } });

    const aComputed = computed(() => sig.value.a);
    const nestedComputed = computed(() => sig.value.b.c);
    expect(sig.value.a).toBe(1);
    expect(aComputed.value).toBe(1);

    sig.value.a = 2;
    expect(sig.value.a).toBe(2);
    expect(aComputed.value).toBe(2);

    expect(nestedComputed.value).toBe(2);

    sig.value.b.c = 3;
    expect(sig.value.b.c).toBe(3);
    expect(nestedComputed.value).toBe(3);
  });
});
