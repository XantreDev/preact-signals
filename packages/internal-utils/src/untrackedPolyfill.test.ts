import { computed, signal } from "@preact/signals-core";
import { describe, expect, it } from "vitest";
import { untrackedPolyfill } from "./untrackedPolyfill";

describe("untracked()", () => {
  it("should not track", () => {
    const sig = signal(0);

    const c = computed(() => untrackedPolyfill(() => sig.value));
    expect(c.value).toBe(0);
    sig.value = 10;
    expect(c.value).toBe(0);
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
});
