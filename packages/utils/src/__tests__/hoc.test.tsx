import { ReadonlySignal, signal } from "@preact-signals/unified-signals";
import React, { PropsWithChildren } from "react";
import { describe, expectTypeOf, it, vi } from "vitest";
import { $, Uncached } from "../$";
import { ReactiveProps, reactifyPropsLite, signalifyProps } from "../hoc/hoc";
import { itRenderer } from "./utils";

describe.concurrent("signalifyProps()", () => {
  for (const valueType of ["signal", "Uncached"] as const) {
    itRenderer(
      `should force rerender dependent component (${valueType})`,
      ({ act, reactRoot, expect, root }) => {
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
      }
    );
  }

  itRenderer(
    "should not rerender when unread signal changed",
    ({ expect, act, reactRoot }) => {
      const B = signalifyProps(vi.fn((props: { value: number }) => null));

      const sig = signal(10);

      act(() => {
        reactRoot().render(<B value={$(() => sig.value)} />);
      });

      expect(B).toHaveBeenCalledTimes(1);
      expect(B).toHaveBeenCalledWith({ value: 10 }, {});

      act(() => {
        sig.value = 20;
      });

      expect(B).toHaveBeenCalledOnce();
    }
  );

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

describe.concurrent("reactifyProps()", () => {
  it("should handle explicitly defined reactive props", () => {
    const A = reactifyPropsLite((props: ReactiveProps<{ value: number }>) => (
      <div>{props.value}</div>
    ));

    expectTypeOf(A)
      .parameter(0)
      .toHaveProperty("value")
      .toEqualTypeOf<number | Uncached<number> | ReadonlySignal<number>>();
  });

  it("should throw on not explicitly defined reactive props", () => {
    const B = reactifyPropsLite((props: { value: number }) => (
      <div>{props.value}</div>
    ));

    expectTypeOf(B).parameter(0).toBeNever();
  });

  itRenderer(
    "should rerender when read signal changed",
    async ({ expect, act, root, reactRoot }) => {
      const sig = signal(10);

      const aRender = vi.fn((props: ReactiveProps<{ value: number }>) => (
        <div>{props.value}</div>
      ));
      const A = reactifyPropsLite(aRender);
      await act(() => reactRoot().render(<A value={sig} />));

      expect(A).toHaveBeenCalledTimes(1);
      expect(A).toHaveBeenCalledWith({ value: 10 }, {});
      expect(root.firstChild).is.instanceOf(HTMLDivElement);
      expect(root.firstChild).has.property("textContent", "10");

      await act(() => {
        sig.value = 20;
      });

      expect(A).toHaveBeenCalledTimes(2);
      expect(A).toHaveBeenCalledWith({ value: 20 }, {});
      expect(root.firstChild).is.instanceOf(HTMLDivElement);
      expect(root.firstChild).has.property("textContent", "20");
    }
  );
  itRenderer(
    "should not rerender when unread signal changed",
    async ({ act, reactRoot, expect }) => {
      const sig = signal(10);

      const aRender = vi.fn((props: ReactiveProps<{ value: number }>) => null);
      const A = reactifyPropsLite(aRender);
      await act(() => reactRoot().render(<A value={sig} />));

      expect(A).toHaveBeenCalledTimes(1);
      expect(A).toHaveBeenCalledWith({ value: 10 }, {});
      await act(() => {
        sig.value = 20;
      });

      expect(A).toHaveBeenCalledTimes(1);
    }
  );
});
