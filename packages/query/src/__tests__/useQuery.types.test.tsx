import { describe, expectTypeOf, vi } from "vitest";
import { UseQueryResult$ } from "../types";
import { useQuery$ } from "../useQuery$";

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
