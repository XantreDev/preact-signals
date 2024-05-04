import { it, describe, expect, vi } from "vitest";
import { effect } from "@preact-signals/unified-signals";
import { reducerSignal } from "./reducer";

const createIncrementSignal = (initialValue: number) =>
  reducerSignal(initialValue, (it) => it + 1);

describe(reducerSignal.name, () => {
  it("constructs", ({ expect }) => {
    const a = createIncrementSignal(10);

    expect(a.value).toBe(10);
  });

  it("dispatches", ({ expect }) => {
    const a = createIncrementSignal(10);

    a.dispatch();

    expect(a.value).toBe(11);
  });

  it("dispatches multiple", ({ expect }) => {
    const a = createIncrementSignal(10);

    a.dispatch();
    a.dispatch();

    expect(a.value).toBe(12);
  });

  it("is reactive", ({ expect }) => {
    const a = createIncrementSignal(10);
    const effectFn = vi.fn(() => {
      a.value;
    });

    const dispose = effect(effectFn);
    expect(effectFn).toHaveBeenCalledOnce();

    a.dispatch();
    expect(effectFn).toBeCalledTimes(2);

    dispose();
  });
  it("allows to destructure dispatch", ({ expect }) => {
    const a = createIncrementSignal(10);
    const { dispatch: increment } = a;
    increment();
    expect(a.value).toBe(11);
  });

  it("passes event correctly", ({ expect }) => {
    const a = reducerSignal(10, (it, action: number) => it + action);
    a.dispatch(5);
    expect(a.value).toBe(15);
  });

  it("does not track deps from reducer", ({ expect }) => {
    const a = reducerSignal(10, (it, action: number) => {
      a.value;
      return it + action;
    });
    a.dispatch(5);
    expect(a.value).toBe(15);
  });

  it("counter example", ({ expect }) => {
    const reducer = (
      it: number,
      action: { type: "increment" | "decrement" }
    ) => {
      switch (action.type) {
        case "increment":
          return it + 1;
        case "decrement":
          return it - 1;
      }
    };
    const counter = reducerSignal(0, reducer);
    counter.dispatch({ type: "increment" });
    expect(counter.value).toBe(1);
    // dispatch can be destructured, other parameters not
    const { dispatch } = counter;
    dispatch({ type: "increment" });
    expect(counter.value).toBe(2);
  });
});
