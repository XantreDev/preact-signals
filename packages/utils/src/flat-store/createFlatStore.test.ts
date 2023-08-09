import { computed, effect, signal } from "@preact-signals/unified-signals";
import { describe, expect, it, vi } from "vitest";
import { createFlatStoreOfSignals, flatStore } from "./index";
import { setterOfFlatStore } from "./setter";

describe("store", () => {
  it("store has correct value", () => {
    const store = flatStore({
      count: 0,
    });

    expect(store.count).toBe(0);
    expect("count" in store).toBeTruthy();
    expect(Object.keys(store)).toEqual(["count"]);
  });

  it("prop can be deleted", () => {
    const store = flatStore<{ count?: number }>({
      count: 0,
    });

    delete store.count;
    expect(store.count).toBeUndefined();
  });
  it("store can have methods", () => {
    const store = flatStore({
      count: 0,
      increment() {
        this.count++;
      },
    });

    store.increment();
    expect(store.count).toBe(1);
  });
  it("store methods can be deleted", () => {
    const store = flatStore<{
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
    const store = flatStore({
      count: 0,
    });

    store.count = 1;
    expect(store.count).toBe(1);
  });

  it("should be reactive", () => {
    const store = flatStore({
      count: 0,
    });

    const derived = computed(() => store.count);

    expect(derived.value).toBe(0);
    store.count = 10;
    expect(derived.value).toBe(10);
  });
});

describe("store setter", () => {
  it("should update store", () => {
    const store = flatStore({
      count: 0,
    });

    setterOfFlatStore(store)({
      count: 1,
    });

    expect(store.count).toBe(1);
  });
  it("should batch signal updates", () => {
    const store = flatStore({
      a: 0,
      b: 0,
    });
    const results: number[] = [];

    const dispose = effect(() => {
      results.push(store.a + store.b);
    });

    setterOfFlatStore(store)({
      a: 1,
      b: 10,
    });

    expect(results).toEqual([0, 11]);
    dispose();
  });

  it("should don't update store if value is the same", () => {
    const store = flatStore({
      count: 0,
    });

    const setter = setterOfFlatStore(store);
    const fn = vi.fn(() => {
      store.count;
    });
    const dispose = effect(fn);

    expect(fn).toHaveBeenCalledOnce();
    setter({
      count: 0,
    });
    expect(fn).toHaveBeenCalledOnce();

    setter({
      count: 0,
    });
    expect(fn).toHaveBeenCalledOnce();

    dispose();
  });

  it("shouldn't update store if value is the same", () => {
    const store = flatStore({
      count: 0,
    });

    const setter = setterOfFlatStore(store);
    const fn = vi.fn(() => {
      store.count;
    });
    const dispose = effect(fn);

    expect(fn).toHaveBeenCalledOnce();
    setter({
      count: 0,
    });
    expect(fn).toHaveBeenCalledOnce();

    setter({
      count: 0,
    });
    expect(fn).toHaveBeenCalledOnce();

    dispose();
  });
});

describe("createFlatStoreOfSignals()", () => {
  it("should create store of signals", () => {
    const a = signal(0);
    const b = signal(0);

    const [store, setter] = createFlatStoreOfSignals({
      a,
      b,
    });

    expect(store.a).toBe(0);
    expect(store.b).toBe(0);

    setter({
      a: 1,
      b: 10,
    });

    expect(store.a).toBe(1);
    expect(store.b).toBe(10);
    expect(a.value).toBe(1);
    expect(b.value).toBe(10);

    store.a = 20;
    store.b = 10;
    expect(store.a).toBe(20);
    expect(store.b).toBe(10);
    expect(a.value).toBe(20);
    expect(b.value).toBe(10);
  });

  it("should should throw types if some signal is readonly", () => {
    const a = signal(0);
    const b = computed(() => 0);

    const [store, setter] = createFlatStoreOfSignals({
      a,
      b,
    });
    expect(() => {
      // @ts-expect-error 'b' is readonly
      store.b = 10;
    }).throws().any;

    expect(() => {
      setter({
        // @ts-expect-error 'b' is readonly
        b: 10,
      });
    }).throws().any;
  });

  it("should work ok with regular values", () => {
    const [store, setter] = createFlatStoreOfSignals({
      a: 5,
      c: 10,
    });

    const comp = computed(() => store.a + store.c);

    expect(store.a).toBe(5);
    expect(store.c).toBe(10);
    expect(comp.value).toBe(15);

    store.a = 20;

    expect(store.a).toBe(20);
    expect(comp.value).toBe(30);
  });
});
