import { useSignalEffectOnce } from "@preact-signals/hooks";
import { untracked } from "@preact-signals/utils";
import { effect, signal } from "@preact/signals-core";
import { QueryClient } from "@tanstack/query-core";
import React from "react";
import { describe } from "vitest";
import { useQuery } from "../react-query";
import { useIsFetching$ } from "../useIsFetching$";
import { renderWithClient } from "./utils";

describe("useIsFetching$", () => {
  it("should show current amount of fetching queries", () => {
    const queryClient = new QueryClient();
    const key = ["test"];
    let renderTimes = 0;
    const $fetchingState = signal<null | number>(null);
    const Component2 = () => {
      const isFetching = useIsFetching$(() => ({
        queryKey: key,
      }));
      $fetchingState.value = untracked(isFetching);
      useSignalEffectOnce(() => {
        $fetchingState.value = isFetching();
      });

      renderTimes++;
      return null;
    };
    const Component = () => {
      useQuery({
        queryKey: key,
        queryFn: () => Promise.resolve("data"),
      });

      return null;
    };
    const result: number[] = [];
    const dispose = effect(() => {
      if ($fetchingState.value === null) return;
      result.push($fetchingState.value);
    });
    renderWithClient(
      queryClient,
      <>
        <Component />
        <Component2 />
      </>
    );
    expect(renderTimes).toBe(1);

    dispose();
  });
});
