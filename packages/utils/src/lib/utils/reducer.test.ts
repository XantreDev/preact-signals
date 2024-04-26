import { it, describe, expect, vi } from "vitest";
import { effect } from "@preact-signals/unified-signals";
import { reducerSignal } from "./reducer";

describe(reducerSignal.name, () => {
  it("constructs", ({ expect }) => {
    const a = reducerSignal(10, (it) => it);

    expect(a.value).toBe(10);
  });

  it("dispatches", ({ expect }) => {
    const a = reducerSignal(10, (it) => it + 1);

    a.dispatch();

    expect(a.value).toBe(11);
  });

  it("dispatches multiple", ({ expect }) => {
    const a = reducerSignal(10, (it) => it + 1);

    a.dispatch();
    a.dispatch();

    expect(a.value).toBe(12);
  });

  it("is reactive", ({ expect }) => {
    const a = reducerSignal(10, (it) => it + 1);
    const effectFn = vi.fn(() => {
      a.value;
    });

    const dispose = effect(effectFn);
    expect(effectFn).toHaveBeenCalledOnce();

    a.dispatch();
    expect(effectFn).toBeCalledTimes(2);

    dispose();
  });

  it("passes event correctly", ({ expect }) => {
    const a = reducerSignal(10, (it, action: number) => it + action);
    a.dispatch(5);
    expect(a.value).toBe(15);
  });
});
