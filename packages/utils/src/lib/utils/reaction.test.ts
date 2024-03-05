import { signal } from "@preact-signals/unified-signals";
import { describe, it, vi } from "vitest";
import { rafReaction, reaction } from "./reaction";

describe.concurrent("reaction()", () => {
  it("should track deps", ({ expect }) => {
    const sig = signal(0);

    const deps = vi.fn(() => sig.value);
    const fn = vi.fn();
    const dispose = reaction(deps, fn);

    expect(fn).toHaveBeenCalledWith(0, { isFirst: true });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(deps).toHaveBeenCalledTimes(1);
    sig.value = 1;

    expect(fn).toHaveBeenCalledWith(1, { isFirst: false });
    expect(fn).toHaveBeenCalledTimes(2);
    expect(deps).toHaveBeenCalledTimes(2);
    dispose();
  });

  it("should not track deps in reaction", ({ expect }) => {
    const sig = signal(0);
    const sig2 = signal(0);

    const deps = vi.fn(() => sig.value);
    const fn = vi.fn(() => {
      sig2.value;
    });
    const dispose = reaction(deps, fn);

    expect(fn).toHaveBeenCalledWith(0, { isFirst: true });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(deps).toHaveBeenCalledTimes(1);

    sig2.value = 1;

    expect(fn).toHaveBeenCalledTimes(1);
    expect(deps).toHaveBeenCalledTimes(1);

    dispose();
  });

  it("should not throw when assigning to deps", ({ expect }) => {
    const sig = signal(1);
    const deps = vi.fn(() => sig.value);
    const fn = vi.fn((v: number) => {
      if (v % 2 === 0) {
        sig.value = v + 1;
      }
    });
    const dispose = reaction(deps, fn);

    expect(fn).toHaveBeenCalledWith(1, { isFirst: true });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(deps).toHaveBeenCalledTimes(1);

    sig.value = 2;
    expect(sig.value).toBe(3);

    expect(fn).toHaveBeenCalledWith(2, { isFirst: false });
    expect(fn).toHaveBeenCalledWith(3, { isFirst: false });
    expect(fn).toHaveBeenCalledTimes(3);
    expect(deps).toHaveBeenCalledTimes(3);

    dispose();
  });

  for (const condition of ["not provided", "false"] as const) {
    it(`should not memoize deps if memoize is ${condition}`, ({ expect }) => {
      const dummySignal = signal(0);
      const increment = () => dummySignal.value++;

      const fn = vi.fn();
      const options =
        condition === "not provided" ? undefined : { memoize: false };
      const dispose = reaction(
        () => {
          dummySignal.value;
          return 10;
        },
        fn,
        options
      );

      expect(fn).toHaveBeenCalledOnce();

      increment();
      increment();

      expect(fn).toHaveBeenCalledTimes(3);
      dispose();
    });
  }

  it(`should memoize deps if memoize is true`, ({ expect }) => {
    const dummySignal = signal(0);
    const increment = () => dummySignal.value++;

    const fn = vi.fn();
    const dispose = reaction(
      () => {
        dummySignal.value;
        return 10;
      },
      fn,
      { memoize: true }
    );

    expect(fn).toHaveBeenCalledOnce();

    increment();
    increment();

    expect(fn).toHaveBeenCalledTimes(1);
    dispose();
  });
  it("should not track fn in reaction with memoize", ({ expect }) => {
    const sig = signal(0);
    const sig2 = signal(0);

    const deps = vi.fn(() => sig.value);
    const fn = vi.fn(() => {
      sig2.value;
    });
    const dispose = reaction(deps, fn, { memoize: true });

    expect(fn).toHaveBeenCalledWith(0, { isFirst: true });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(deps).toHaveBeenCalledTimes(1);

    sig2.value = 1;

    expect(fn).toHaveBeenCalledTimes(1);
    expect(deps).toHaveBeenCalledTimes(1);

    dispose();
  });

  it("should execute dispose callback when deps is rotten", ({ expect }) => {
    const sig = signal(0);
    const increment = () => sig.value++;

    const disposeFn = vi.fn();

    const dispose = reaction(
      () => sig.value,
      () => disposeFn
    );

    expect(disposeFn).not.toHaveBeenCalled();
    increment();

    expect(disposeFn).toHaveBeenCalledTimes(1);
    increment();
    expect(disposeFn).toHaveBeenCalledTimes(2);

    dispose();
  });
});

const waitRaf = () => new Promise((resolve) => requestAnimationFrame(resolve));

describe.concurrent("rafReaction()", () => {
  it("should track deps", async ({ expect }) => {
    const sig = signal(0);

    const deps = vi.fn(() => sig.value);
    const fn = vi.fn();
    const dispose = rafReaction(deps, fn);
    expect(deps).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledTimes(0);
    await waitRaf();
    expect(fn).toHaveBeenCalledTimes(1);

    dispose();
  });

  it("should execute only once per frame", async ({ expect }) => {
    const sig = signal(0);

    const deps = vi.fn(() => sig.value);
    const fn = vi.fn();
    const dispose = rafReaction(deps, fn);
    expect(deps).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledTimes(0);
    sig.value = 1;
    expect(deps).toHaveBeenCalledTimes(2);
    sig.value = 2;
    expect(deps).toHaveBeenCalledTimes(3);
    await waitRaf();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(2, { isFirst: true });
    sig.value = 3;
    await waitRaf();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith(3, { isFirst: false });

    dispose();
  });
  it("should not cycle", async ({ expect }) => {
    const sig = signal(0);

    const deps = vi.fn(() => sig.value);
    const fn = vi.fn(() => {
      sig.value++;
    });
    const dispose = rafReaction(deps, fn);
    expect(deps).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledTimes(0);
    sig.value = 1;
    expect(deps).toHaveBeenCalledTimes(2);
    sig.value = 2;
    expect(deps).toHaveBeenCalledTimes(3);
    await waitRaf();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(2, { isFirst: true });
    await waitRaf();
    expect(fn).toHaveBeenCalledTimes(2);
    dispose();
  });
  it("should not execute if fn if reaction is disposed", async ({ expect }) => {
    const sig = signal(0);

    const deps = vi.fn(() => sig.value);
    const fn = vi.fn();
    const dispose = rafReaction(deps, fn);
    expect(deps).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledTimes(0);
    dispose();
    await waitRaf();
    expect(fn).toHaveBeenCalledTimes(0);
  });
});
