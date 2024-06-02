import { describe, expectTypeOf, it } from "vitest";
import * as macro from "../lib/macro";
import { ReadonlySignal } from "@preact/signals-core";

describe("macros types", () => {
  it("$deref state types", () => {
    () => {
      expectTypeOf(() => {
        let a = macro.$state(10);

        return macro.$deref(a);
      }).returns.toEqualTypeOf<ReadonlySignal<10>>();

      expectTypeOf(() => {
        let a = macro.$useState(10);

        return macro.$deref(a);
      }).returns.toEqualTypeOf<ReadonlySignal<10>>();
    };
  });

  it("$deref readonly state types", () => {
    () => {
      expectTypeOf(() => {
        let a = macro.$derived(10);

        return macro.$deref(a);
      }).returns.toEqualTypeOf<ReadonlySignal<10>>();

      expectTypeOf(() => {
        let a = macro.$useLinkedState(10);

        return macro.$deref(a);
      }).returns.toEqualTypeOf<ReadonlySignal<10>>();

      expectTypeOf(() => {
        let a = macro.$useDerived(10);

        return macro.$deref(a);
      }).returns.toEqualTypeOf<ReadonlySignal<10>>();
    };
  });

  it("$deref shouldn't work with incorrect types", () => {
    () => {
      {
        const a = 10;

        // @ts-expect-error
        return macro.$deref(a);
      }
    };
  });
});
