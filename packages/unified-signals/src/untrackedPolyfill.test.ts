import { describe, expect, it, vi } from "vitest";
import { computed, effect, signal } from "./reexports";
import { untrackedPolyfill } from "./untrackedPolyfill";

describe("untracked()", () => {
  it("should return value", () => {
    const sig = signal(0);
    expect(untrackedPolyfill(() => sig.value)).toBe(0);
  });
  it("should not track", () => {
    const sig = signal(0);

    const untrackedFn = vi.fn(() => sig.value);

    const c = computed(() => untrackedPolyfill(untrackedFn));
    const c2 = computed(() => sig.value);
    expect(c.value).toBe(0);
    expect(c2.value).toBe(0);
    expect(untrackedFn).toHaveBeenCalledOnce();
    sig.value = 10;
    expect(c.value).toBe(0);
    expect(c2.value).toBe(10);
    expect(untrackedFn).toHaveBeenCalledOnce();
  });
  it("should not track when nested", () => {
    const sig = signal(0);

    const untrackedFnNested = vi.fn(() => sig.value);
    const untrackedFn = vi.fn(() => untrackedPolyfill(untrackedFnNested));

    const c = computed(untrackedFn);
    expect(c.value).toBe(0);
    expect(untrackedFn).toHaveBeenCalledOnce();
    sig.value = 10;
    expect(c.value).toBe(0);
    expect(untrackedFn).toHaveBeenCalledOnce();
  });

  it("should allow to write signals", () => {
    const sig = signal(0);

    untrackedPolyfill(() => {
      sig.value = 10;
    });

    expect(sig.value).toBe(10);
  });

  it("should not fail into infinite recursion if reading and changing same signal", () => {
    const sig = signal(0);

    const untrackedFn = vi.fn(() => {
      if (sig.value === 0) {
        sig.value = 10;
      }
    });
    const effectFn = vi.fn(() => {
      untrackedPolyfill(untrackedFn);
    });
    const dispose = effect(effectFn);
    expect(untrackedFn).toHaveBeenCalledOnce();
    expect(effectFn).toHaveBeenCalledOnce();
    expect(sig.value).toBe(10);

    dispose();
  });
});
