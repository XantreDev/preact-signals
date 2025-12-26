import { describe, expectTypeOf, vi } from "vitest";
import { UseQueryResult$ } from "../types.ts";
import { useQuery$ } from "../useQuery$.ts";

describe("useQuery$() types", () => {
  vi.mock("../useQuery$", () => ({
    useQuery$: () => {},
  }));
  it("should inherit types", () => {
    expectTypeOf(
      useQuery$(() => ({
        queryKey: ["key"],
        queryFn: () => Promise.resolve("data"),
      }))
    ).toMatchTypeOf<UseQueryResult$<string, unknown>>();
  });
});
