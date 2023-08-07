import { ReadonlySignal, signal } from "@preact-signals/unified-signals";
import React, { PropsWithChildren } from "react";
import { describe, expectTypeOf, it, vi } from "vitest";
import { $, Uncached } from "../$";
import { ReactiveProps, reactifyLite, withSignalProps } from "../hocs";
import { reactify } from "../hocs/reactify";
import { itRenderer } from "./utils";

describe.concurrent("withSignalProps()", () => {
  for (const valueType of ["signal", "Uncached"] as const) {
    itRenderer(
      `should force rerender dependent component (${valueType})`,
      ({ act, reactRoot, expect, root }) => {
        const B = withSignalProps(
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
      const B = withSignalProps(vi.fn((props: { value: number }) => null));

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
    const B = withSignalProps((props: PropsWithChildren<{ value: number }>) => (
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

describe.concurrent("reactifyLite()", () => {
  it("should handle explicitly defined reactive props", () => {
    const A = reactifyLite((props: ReactiveProps<{ value: number }>) => (
      <div>{props.value}</div>
    ));

    expectTypeOf(A)
      .parameter(0)
      .toHaveProperty("value")
      .toEqualTypeOf<number | Uncached<number> | ReadonlySignal<number>>();
  });

  it("should throw on not explicitly defined reactive props", () => {
    const B = reactifyLite((props: { value: number }) => (
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
      const A = reactifyLite(aRender);
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
      const A = reactifyLite(aRender);
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

describe.concurrent("reactify()", () => {
  itRenderer(
    "should support value$ postfix",
    async ({ expect, root, reactRoot }) => {
      const A = reactify(
        vi.fn((props: ReactiveProps<{ value: number }>) => (
          <div>{props.value}</div>
        ))
      );

      await reactRoot().render(<A value$={() => 10} />);

      expect(A).toHaveBeenCalledTimes(1);
      expect(A).toHaveBeenCalledWith({ value: 10 }, {});
      expect(root.firstChild).is.instanceOf(HTMLDivElement);
      expect(root.firstChild).has.property("textContent", "10");
    }
  );
  for (const valueType of ["signal", "uncached", "$postfix"] as const) {
    itRenderer(
      `should rerender when deps changed. deps type: ${valueType}}`,
      async ({ expect, act, root, reactRoot }) => {
        const A = reactify(
          vi.fn((props: ReactiveProps<{ value: number }>) => (
            <div>{props.value}</div>
          ))
        );

        const sig = signal(10);

        if (valueType === "$postfix") {
          await act(() => reactRoot().render(<A value$={() => sig.value} />));
        } else {
          await reactRoot().render(
            <A value={valueType === "signal" ? sig : $(() => sig.value)} />
          );
        }

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
  }

  itRenderer(
    "should not rerender when unread signal changed",
    async ({ expect, act, reactRoot }) => {
      const A = reactify(
        vi.fn((props: ReactiveProps<{ value: number }>) => null)
      );

      const sig = signal(10);

      await reactRoot().render(<A value={sig} />);
      expect(A).toHaveBeenCalledTimes(1);
      expect(A).toHaveBeenCalledWith({ value: 10 }, {});

      await act(() => {
        sig.value = 20;
      });

      expect(A).toHaveBeenCalledTimes(1);
    }
  );
  itRenderer(
    "should correctly pass props",
    async ({ expect, act, reactRoot }) => {
      const A = reactify(
        vi.fn(
          (
            props: ReactiveProps<{
              a: number;
              b: () => void;
              c: ReadonlySignal<number>;
            }>
          ) => null
        )
      );

      const sig = signal(10);

      const noop = () => {};
      await reactRoot().render(<A a$={() => 10} b={noop} c$={() => sig} />);
      expect(A).toHaveBeenCalledTimes(1);
      expect(A).toHaveBeenCalledWith({ a: 10, b: noop, c: sig }, {});
    }
  );
});
