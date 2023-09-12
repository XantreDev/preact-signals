import { batch, effect } from "@preact-signals/unified-signals";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { $ } from "../..";
import { reactive } from "../../store";
import { itRenderer, sleep } from "../utils";

describe("store", () => {
  it("should correctly batch events", () => {
    const store = reactive({
      count: 0,
    });
    const fn = vi.fn(() => store.count);
    effect(fn);
    expect(fn).toHaveBeenCalledTimes(1);

    store.count++;
    store.count++;

    expect(fn).toHaveBeenCalledTimes(3);

    batch(() => {
      store.count++;
      store.count++;
    });
    expect(fn).toHaveBeenCalledTimes(4);
  });

  itRenderer("should work with react", async ({ expect, reactRoot, root }) => {
    const store = reactive({
      count: 0,
    });
    reactRoot().render(<div>{$(() => store.count)}</div>);

    expect(root.innerHTML).toBe("<div>0</div>");

    store.count++;

    await sleep(10);

    expect(root.innerHTML).toBe("<div>1</div>");
  });
});
