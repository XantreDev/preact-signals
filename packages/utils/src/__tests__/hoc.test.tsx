import { ReadonlySignal, signal } from "@preact/signals-core";
import { PropsWithChildren } from "react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { $, Uncached } from "../$";
import { ReactiveProps, reactifyProps, signalifyProps } from "../hoc";
import { createRenderer } from "./utils";

describe("signalifyProps()", () => {
  const { act, reactRoot, root } = createRenderer();

  for (const valueType of ["signal", "Uncached"] as const) {
    it(`should force rerender dependent component (${valueType})`, () => {
      const B = signalifyProps(
        vi.fn((props: { value: number }) => <div>{props.value}</div>)
      );

      const sig = signal(10);

      act(() => {
        reactRoot().render(
          <B value={valueType === "signal" ? sig : $(() => sig.value)} />
        );
      });

      expect(B).toHaveBeenCalledTimes(1);
      expect(B).toHaveBeenCalledWith({ value: 10 }, {});
      expect(root.firstChild).is.instanceOf(HTMLDivElement);
      expect(root.firstChild).has.property("textContent", "10");

      act(() => {
        sig.value = 20;
      });

      expect(B).toHaveBeenCalledTimes(2);
      expect(B).toHaveBeenCalledWith({ value: 20 }, {});
      expect(root.firstChild).is.instanceOf(HTMLDivElement);
      expect(root.firstChild).has.property("textContent", "20");
    });
  }

  it("should handle types", () => {
    const B = signalifyProps((props: PropsWithChildren<{ value: number }>) => (
      <div>{props.value}</div>
    ));

    expectTypeOf(B)
      .parameter(0)
      .toHaveProperty("value")
      .toEqualTypeOf<number | Uncached<number> | ReadonlySignal<number>>();
    expectTypeOf(B)
      .parameter(0)
      .toHaveProperty("children")
      .toEqualTypeOf<React.ReactNode>();
  });
});

describe("reactifyProps()", () => {
  it("should handle explicitly defined reactive props", () => {
    const A = reactifyProps((props: ReactiveProps<{ value: number }>) => (
      <div>{props.value}</div>
    ));

    expectTypeOf(A)
      .parameter(0)
      .toHaveProperty("value")
      .toEqualTypeOf<number | Uncached<number> | ReadonlySignal<number>>();
  });

  it("should throw on not explicitly defined reactive props", () => {
    const B = reactifyProps((props: { value: number }) => (
      <div>{props.value}</div>
    ));

    expectTypeOf(B).parameter(0).toBeNever();
  });
});
