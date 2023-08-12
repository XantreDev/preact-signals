import { computed, effect, signal } from "@preact-signals/unified-signals";
import { describe, it, vi } from "vitest";
import { createFlatStoreOfSignals, flatStore } from "./index";
import { setterOfFlatStore } from "./setter";

describe.concurrent("store", () => {
  it("store has correct value", ({ expect }) => {
    const store = flatStore({
      count: 0,
    });

    expect(store.count).toBe(0);
    expect("count" in store).toBeTruthy();
    expect(Object.keys(store)).toEqual(["count"]);
  });

  it("prop can be deleted", ({ expect }) => {
    const store = flatStore<{ count?: number }>({
      count: 0,
    });

    delete store.count;
    expect(store.count).toBeUndefined();
  });
  it("store can have methods", ({ expect }) => {
    const store = flatStore({
      count: 0,
      increment() {
        this.count++;
      },
    });

    expect(store.count).toBe(0);
    store.increment();
    expect(store.count).toBe(1);
    store.count++;
    expect(store.count).toBe(2);
  });
  it("store methods should access proxified object", ({ expect }) => {
    const store = flatStore({
      count: 0,
      increment() {
        this.count++;
      },
      double() {
        return this.count * 2;
      },
    });

    expect(store.count).toBe(0);
    expect(store.double()).toBe(0);
    store.increment();
    expect(store.count).toBe(1);
    expect(store.double()).toBe(2);

    store.count++;
    expect(store.count).toBe(2);
    expect(store.double()).toBe(4);
  });
  it("store methods can be deleted", ({ expect }) => {
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
  it("store can be updated", ({ expect }) => {
    const store = flatStore({
      count: 0,
    });

    store.count = 1;
    expect(store.count).toBe(1);
  });

  it("should be reactive", ({ expect }) => {
    const store = flatStore({
      count: 0,
    });

    const derived = computed(() => store.count);

    expect(derived.value).toBe(0);
    store.count = 10;
    expect(derived.value).toBe(10);
  });
});

describe.concurrent("store setter", () => {
  it("should update store", ({ expect }) => {
    const store = flatStore({
      count: 0,
    });

    setterOfFlatStore(store)({
      count: 1,
    });

    expect(store.count).toBe(1);
  });
  it("should batch signal updates", ({ expect }) => {
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

  it("should don't update store if value is the same", ({ expect }) => {
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

  it("shouldn't update store if value is the same", ({ expect }) => {
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
  it("function");

  it("should create computeds from getters", ({ expect }) => {
    const store = flatStore({
      count: 1,
      get double() {
        console.log("double this", this);
        return this.count * 2;
      },
    });

    expect(store.count).toBe(1);
    expect(store.double).toBe(2);

    store.count = 2;
    expect(store.count).toBe(2);
    expect(store.double).toBe(4);
  });
});

describe.concurrent("createFlatStoreOfSignals()", () => {
  it("should create store of signals", ({ expect }) => {
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

  it("should should throw types if some signal is readonly", ({ expect }) => {
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

  it("should work ok with regular values", ({ expect }) => {
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
  it("should create implicit computeds from getters", ({ expect }) => {
    const [store] = createFlatStoreOfSignals({
      a: 1,
      get double() {
        return this.a * 2;
      },
    });

    expect(store.a).toBe(1);
    expect(store.double).toBe(2);

    store.a = 2;
    expect(store.a).toBe(2);
    expect(store.double).toBe(4);
  });
});
