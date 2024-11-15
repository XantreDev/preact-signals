import { effect, signal } from "@preact-signals/unified-signals";
import { describe, it, vi } from "vitest";
import { writableRefOfObjectProp, writableRefOfArrayProp } from "./object";

describe.concurrent("writableRefOfObjectProp()", () => {
  it("should get and set value in object", ({ expect }) => {
    const sig = signal({
      a: 0,
    });

    const prop = writableRefOfObjectProp(sig, "a");

    expect(prop.value).toBe(0);

    prop.value = 1;

    expect(prop.value).toBe(1);
    expect(sig.value.a).toBe(1);
  });

  it("should change if parent changed", ({ expect }) => {
    const sig = signal({
      a: 0,
    });

    const aProp = writableRefOfObjectProp(sig, "a");

    expect(aProp.value).toBe(0);

    sig.value = {
      a: 1,
    };

    expect(aProp.value).toBe(1);
  });

  it("e2e", ({ expect }) => {
    const sig = signal({
      a: 0,
    });

    const aProp = writableRefOfObjectProp(sig, "a");

    expect(aProp.value).toBe(0);

    const depsParent = vi.fn(() => sig.value);
    const disposeParent = effect(depsParent);

    expect(depsParent).toHaveBeenCalledTimes(1);

    const deps = vi.fn(() => aProp.value);
    const dispose = effect(deps);

    expect(deps).toHaveBeenCalledTimes(1);
    aProp.value = 1;

    expect(deps).toHaveBeenCalledTimes(2);
    expect(depsParent).toHaveBeenCalledTimes(2);
    expect(aProp.value).toBe(1);
    expect(sig.value.a).toBe(1);

    dispose();
    disposeParent();
  });

  it("should work with WritableUncached", ({ expect }) => {
    const sig = signal({
      a: 0,
      b: {
        c: 0,
      },
    });

    const sigDeps = vi.fn(() => {
      sig.value;
    });

    const disposeSig = effect(sigDeps);
    expect(sigDeps).toHaveBeenCalledTimes(1);

    const aProp = writableRefOfObjectProp(sig, "a");
    const bProp = writableRefOfObjectProp(sig, "b");
    const cProp = writableRefOfObjectProp(bProp, "c");

    const bDeps = vi.fn(() => {
      bProp.value;
    });
    const cDeps = vi.fn(() => {
      cProp.value;
    });

    const disposeB = effect(bDeps);
    const disposeC = effect(cDeps);

    expect(sigDeps).toHaveBeenCalledTimes(1);
    expect(bDeps).toHaveBeenCalledTimes(1);

    expect(aProp.value).toBe(0);
    expect(bProp.value.c).toBe(0);
    expect(cProp.value).toBe(0);

    cProp.value = 1;

    expect(sigDeps).toHaveBeenCalledTimes(2);
    expect(bDeps).toHaveBeenCalledTimes(2);
    expect(cDeps).toHaveBeenCalledTimes(2);

    expect(aProp.value).toBe(0);
    expect(bProp.value.c).toBe(1);
    expect(cProp.value).toBe(1);

    disposeSig();
  });
});

describe.concurrent("writableRefOfArrayProp()", () => {
  it("should get and set value in array", ({ expect }) => {
    const sig = signal([1, 2, 3]);

    const prop = writableRefOfArrayProp(sig, 1);

    expect(prop.value).toBe(2);

    prop.value = 4;

    expect(prop.value).toBe(4);
    expect(sig.value[1]).toBe(4);
  });

  it("should change if parent changed", ({ expect }) => {
    const sig = signal([1, 2, 3]);

    const prop = writableRefOfArrayProp(sig, 1);

    expect(prop.value).toBe(2);

    sig.value = [1, 4, 3];

    expect(prop.value).toBe(4);
  });
});
