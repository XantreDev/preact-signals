import { useSignalEffectOnce } from "@preact-signals/hooks";
import { untracked } from "@preact-signals/utils";
import { effect, signal } from "@preact/signals-core";
import { describe } from "vitest";
import { useQuery } from "../react-query";
import { useIsFetching$ } from "../useIsFetching$";
import { createQueryClient, queryKey, renderWithClient, sleep } from "./utils";

describe("useIsFetching$", () => {
  it("should show current amount of fetching queries", async () => {
    const queryClient = createQueryClient();
    const key1 = queryKey();
    const key2 = queryKey();
    let renderTimes = 0;
    const $fetchingState = signal<null | number>(null);
    const dispose = effect(() => {
      if ($fetchingState.value === null) return;
      result.push($fetchingState.value);
    });

    const Component1 = () => {
      const isFetching = useIsFetching$(() => null);
      $fetchingState.value = untracked(isFetching);
      useSignalEffectOnce(() => {
        $fetchingState.value = isFetching();
      });

      renderTimes++;
      return null;
    };
    const Component2 = () => {
      useQuery({
        queryKey: key1,
        queryFn: async () => {
          await sleep(10);
          return "data";
        },
      });

      useQuery({
        queryKey: key2,
        queryFn: async () => {
          await sleep(10);
          return "data";
        },
      });
      return null;
    };
    const result: number[] = [];
    renderWithClient(
      queryClient,
      <>
        <Component1 />
        <Component2 />
      </>
    );
    await sleep(20);
    expect(renderTimes).toBe(1);

    expect(result).toEqual([0, 1, 2, 1, 0]);

    dispose();
  });
});
