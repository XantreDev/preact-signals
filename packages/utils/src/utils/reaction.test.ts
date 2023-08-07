import { signal } from "@preact-signals/unified-signals";
import { describe, it, vi } from "vitest";
import { reaction } from "./reaction";
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
});
