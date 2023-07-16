import { computed, signal } from "@preact/signals-core";
import { describe, expect, it } from "vitest";
import { untracked } from "./untracked";

describe("untracked()", () => {
  it("should not track", () => {
    const sig = signal(0);

    const c = computed(() => untracked(() => sig.value));
    expect(c.value).toBe(0);
    sig.value = 10;
    expect(c.value).toBe(0);
  });
  it("should not track when nested", () => {
    const sig = signal(0);

    const c = computed(() =>
      untracked(() => {
        return untracked(() => sig.value);
      })
    );
    expect(c.value).toBe(0);
    sig.value = 10;
    expect(c.value).toBe(0);
  });
});
