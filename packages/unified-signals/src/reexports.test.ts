import * as preactSignals from "@preact/signals-react";
import { describe, expect, it } from "vitest";
import * as unifiedSignals from "./reexports";

describe("unified-signals", () => {
  it("should export same exports as @preact/signals-react", () => {
    expect(unifiedSignals).toEqual(preactSignals);
  });
});
