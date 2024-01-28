import { describe, expectTypeOf, it } from "vitest";
import { ReactifyComponentReturn } from "./reactify";
describe("reactify()", () => {
  // it("should transform props in case of correct types", () => {
  //   expectTypeOf<
  //     ReactiveComponentReturn<{ a: Uncached<number> }, { a: number }>
  //   >().toMatchTypeOf<{
  //     a: Uncached<number> | ReadonlySignal<number>;
  //   }>();

  //   expectTypeOf<
  //     ReactiveComponentReturn<{ a: ReadonlySignal<number> }, { a: number }>
  //   >().toEqualTypeOf<{
  //     a: Uncached<number> | ReadonlySignal<number>;
  //   }>();

  //   expectTypeOf<
  //     ReactiveComponentReturn<{ a$: () => number }, { a: number }>
  //   >().toEqualTypeOf<{
  //     a$: () => number;
  //   }>();
  // });
  it("should throw if initial has $ postfix", () => {
    expectTypeOf<
      ReactifyComponentReturn<{ a$: () => number }, { a$: number }>
    >().toEqualTypeOf<{
      "reactify.reactive-props.error": "you cannot use a key that ends with $";
    }>();
  });
});
