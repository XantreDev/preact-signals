import { ReadonlySignal } from "@preact-signals/unified-signals";
import { describe, expectTypeOf, it } from "vitest";
import { Uncached } from "../$";
import { ReactifyProps } from "./hoc";
describe("ReactifyProps", () => {
  it("should transform props in case of correct types", () => {
    expectTypeOf<
      ReactifyProps<{ a: Uncached<number> }, { a: number }>
    >().toMatchTypeOf<{
      a: Uncached<number> | ReadonlySignal<number>;
    }>();

    expectTypeOf<
      ReactifyProps<{ a: ReadonlySignal<number> }, { a: number }>
    >().toEqualTypeOf<{
      a: Uncached<number> | ReadonlySignal<number>;
    }>();

    expectTypeOf<
      ReactifyProps<{ a$: () => number }, { a: number }>
    >().toEqualTypeOf<{
      a$: () => number;
    }>();
  });
  it("should throw if initial has $ postfix", () => {
    expectTypeOf<
      ReactifyProps<{ a$: () => number }, { a$: number }>
    >().toEqualTypeOf<{
      "reactify.reactive-props.error": "you cannot use a key that ends with $";
    }>();
  });
});
