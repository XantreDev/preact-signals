import {
  ReadonlySignal,
  computed,
  signal,
} from "@preact-signals/unified-signals";
import React, { PropsWithChildren } from "react";
import { assert, describe, expect, expectTypeOf, it, vi } from "vitest";
import { $, ReactiveRef } from "../lib/$";
import { ReactiveProps, reactifyLite, withSignalProps } from "../lib/hocs";
import { reactify } from "../lib/hocs/reactify";
import { itRenderer } from "./utils";

describe("withSignalProps()", () => {
  for (const valueType of ["signal", "Uncached"] as const) {
    itRenderer(
      `should force rerender dependent component (${valueType})`,
      async ({ act, reactRoot, expect, root }) => {
        const B = withSignalProps(
          vi.fn((props: { value: number }) => <div>{props.value}</div>)
        );

        const sig = signal(10);

        await reactRoot().render(
          <B value={valueType === "signal" ? sig : $(() => sig.value)} />
        );

        expect(B).toHaveBeenCalledTimes(1);
        expect(B).toHaveBeenCalledWith({ value: 10 }, {});
        expect(root.firstChild).is.instanceOf(HTMLDivElement);
        expect(root.firstChild).has.property("textContent", "10");

        await act(() => {
          sig.value = 20;
        });

        expect(B).toHaveBeenCalledTimes(2);
        expect(B).toHaveBeenCalledWith({ value: 20 }, {});
        expect(root.firstChild).is.instanceOf(HTMLDivElement);
        expect(root.firstChild).has.property("textContent", "20");
      }
    );
  }
  it("should add prefix to props", () => {
    const B = withSignalProps(vi.fn((props: { value: number }) => null));

    assert(
      B.displayName?.startsWith("WithSignalProps."),
      "displayName incorrect"
    );
  });

  itRenderer(
    "should not rerender when unread signal changed",
    async ({ expect, act, reactRoot }) => {
      const B = withSignalProps(vi.fn((props: { value: number }) => null));

      const sig = signal(10);

      await reactRoot().render(<B value={$(() => sig.value)} />);

      expect(B).toHaveBeenCalledTimes(1);
      expect(B).toHaveBeenCalledWith({ value: 10 }, {});

      await act(() => {
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
      .toEqualTypeOf<number | ReactiveRef<number> | ReadonlySignal<number>>();
    expectTypeOf(B)
      .parameter(0)
      .toHaveProperty("children")
      .toEqualTypeOf<React.ReactNode>();
  });
});

describe("reactifyLite()", () => {
  it("should handle explicitly defined reactive props", () => {
    const A = reactifyLite((props: ReactiveProps<{ value: number }>) => (
      <div>{props.value}</div>
    ));

    expectTypeOf(A)
      .parameter(0)
      .toHaveProperty("value")
      .toEqualTypeOf<number | ReactiveRef<number> | ReadonlySignal<number>>();
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

      /**
       * @useSignals
       */
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
  itRenderer(
    "should update props when regular props changed",
    async ({ act, reactRoot, expect }) => {
      const sig = signal(10);

      /**
       * @useSignals
       */
      const aRender = vi.fn(
        (props: ReactiveProps<{ value: number }>) => props.value
      );
      const A = reactifyLite(aRender);
      const B = () => <A value={sig.value} />;
      await act(() => reactRoot().render(<B />));

      expect(A).toHaveBeenCalledTimes(1);
      expect(A).lastCalledWith({ value: 10 }, {});
      await act(() => {
        sig.value = 20;
      });

      expect(A).toHaveBeenCalledTimes(2);
      expect(A).lastCalledWith({ value: 20 }, {});
    }
  );
  itRenderer(
    "should update regular props reactively",
    async ({ act, reactRoot, expect }) => {
      const sig = signal(10);
      let cmp: null | ReadonlySignal<number> = null;

      const aRender = vi.fn((props: ReactiveProps<{ value: number }>) => {
        if (!cmp) {
          cmp = computed(() => props.value);
        }
        return null;
      });
      const A = reactifyLite(aRender);
      const B = () => <A value={sig.value} />;
      await act(() => reactRoot().render(<B />));

      expect(A).toHaveBeenCalledTimes(1);
      expect(A).lastCalledWith({ value: 10 }, {});
      await act(() => {
        sig.value = 20;
      });

      expect(A).toHaveBeenCalledTimes(2);
      expect(A).lastCalledWith({ value: 20 }, {});
      expect(cmp!.value).toBe(20);
    }
  );
  itRenderer(
    "should not allow to access previous omitted prop",
    async ({ act, reactRoot, expect }) => {
      const sig = signal(10);

      const aRender = vi.fn((props: ReactiveProps<{ value?: number }>) => {
        return null;
      });
      const A = reactifyLite(aRender);
      const B = () => <A {...(sig.value === 10 ? { value: 10 } : {})} />;
      await act(() => reactRoot().render(<B />));

      expect(A).toHaveBeenCalledTimes(1);
      expect(A).toHaveBeenLastCalledWith({ value: 10 }, {});
      await act(() => {
        sig.value = 20;
      });

      expect(A).toHaveBeenCalledTimes(2);
      expect(A).toHaveBeenLastCalledWith({}, {});
    }
  );
});

describe("reactify()", () => {
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
