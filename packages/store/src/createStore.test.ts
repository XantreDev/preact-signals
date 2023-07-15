import { computed } from "@preact/signals-core";
import { describe, expect, it } from "vitest";
import { createStore } from "./index";

describe("store", () => {
  it("store has correct value", () => {
    const store = createStore({
      count: 0,
    });

    expect(store.count).toBe(0);
    expect("count" in store).toBeTruthy();
    expect(Object.keys(store)).toEqual(["count"]);
  });

  it("prop can be deleted", () => {
    const store = createStore<{ count?: number }>({
      count: 0,
    });

    delete store.count;
    expect(store.count).toBeUndefined();
  });
  it("store can have methods", () => {
    const store = createStore({
      count: 0,
      increment() {
        this.count++;
      },
    });

    store.increment();
    expect(store.count).toBe(1);
  });
  it("store methods can be deleted", () => {
    const store = createStore<{
      count: number;
      increment?(): void;
    }>({
      count: 0,
      increment() {
        this.count++;
      },
    });

    delete store.increment;
    expect(store.increment).toBeUndefined();
  });
  it("store can be updated", () => {
    const store = createStore({
      count: 0,
    });

    store.count = 1;
    expect(store.count).toBe(1);
  });

  it("should be reactive", () => {
    const store = createStore({
      count: 0,
    });

    const derived = computed(() => store.count);

    expect(derived.value).toBe(0);
    store.count = 10;
    expect(derived.value).toBe(10);
  });
});
