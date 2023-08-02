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

    const c = computed(() => untrackedPolyfill(() => sig.value));
    const c2 = computed(() => sig.value);
    expect(c.value).toBe(0);
    expect(c2.value).toBe(0);
    sig.value = 10;
    expect(c.value).toBe(0);
    expect(c2.value).toBe(10);
  });
  it("should not track when nested", () => {
    const sig = signal(0);

    const c = computed(() =>
      untrackedPolyfill(() => {
        return untrackedPolyfill(() => sig.value);
      })
    );
    expect(c.value).toBe(0);
    sig.value = 10;
    expect(c.value).toBe(0);
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

    const effectFn = vi.fn(() => {
      untrackedPolyfill(() => {
        if (sig.value === 0) {
          sig.value = 10;
        }
      });
    });
    const dispose = effect(effectFn);
    expect(effectFn).toHaveBeenCalledOnce();
    expect(sig.value).toBe(10);

    dispose();
  });
});
