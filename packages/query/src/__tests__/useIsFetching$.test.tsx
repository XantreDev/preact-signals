import { useSignalEffectOnce } from "@preact-signals/hooks";
import { untracked } from "@preact-signals/utils";
import { ReadonlySignal, effect, signal } from "@preact/signals-core";
import { createElement, useEffect, useState } from "react";
import { describe } from "vitest";
import { useQuery } from "../react-query";
import { useIsFetching$ } from "../useIsFetching$";
import { createQueryClient, queryKey, renderWithClient, sleep } from "./utils";

const queueSignal = <T,>() => {
  const noValue = Symbol("no-value");
  const $signal = signal<T | typeof noValue>(noValue);
  const queue = [] as T[];

  const dispose = effect(() => {
    if ($signal.value === noValue) return;
    queue.push($signal.value);
  });

  return {
    queue,
    emit: (value: T) => {
      $signal.value = value;
    },
    dispose,
  };
};

// for some reason signals runtime is not working with tests
const useSignalState = <T,>(signal: ReadonlySignal<T>): T => {
  const [state, setState] = useState(signal.value);

  useEffect(() => effect(() => setState(signal.value)), [signal]);

  return state;
};
const fetchTime = (ms: number) => async () => {
  await sleep(ms);

  return "data";
};

const createHooksComponentElement = (hooks: () => unknown) => {
  const Component = () => {
    hooks();

    return null;
  };

  return createElement(Component);
};

const fetch10ms = fetchTime(10);
describe("useIsFetching$", () => {
  it("should show current amount of fetching queries", async () => {
    const queryClient = createQueryClient();
    const key1 = queryKey();
    const key2 = queryKey();
    let renderTimes = 0;
    const { emit, queue, dispose } = queueSignal<number>();

    const Component1 = () => {
      const isFetching = useIsFetching$(() => null);
      emit(untracked(isFetching));
      useSignalEffectOnce(() => {
        emit(isFetching());
      });

      renderTimes++;
      return null;
    };
    const Component2 = () => {
      useQuery({
        queryKey: key2,
        queryFn: fetch10ms,
      });
      return null;
    };
    renderWithClient(
      queryClient,
      <>
        <Component1 />
        {createHooksComponentElement(() => {
          useQuery({
            queryKey: key1,
            queryFn: fetch10ms,
          });
          useQuery({
            queryKey: key2,
            queryFn: fetch10ms,
          });
        })}
      </>
    );
    await sleep(20);
    expect(renderTimes).toBe(1);

    expect(queue).toEqual([0, 1, 2, 1, 0]);

    dispose();
  });

  it("should be able to filter", async () => {
    const queryClient = createQueryClient();
    const key1 = queryKey();
    const key2 = queryKey();
    let renderTimes = 0;
    const { emit, queue, dispose } = queueSignal<number>();

    const Component1 = () => {
      const isFetching = useIsFetching$(() => ({
        queryKey: key1,
      }));
      emit(untracked(isFetching));
      useSignalEffectOnce(() => {
        emit(isFetching());
      });

      renderTimes++;
      return null;
    };
    renderWithClient(
      queryClient,
      <>
        <Component1 />
        {createHooksComponentElement(() => {
          useQuery({
            queryKey: key1,
            queryFn: fetch10ms,
          });

          useQuery({
            queryKey: key2,
            queryFn: fetch10ms,
          });
        })}
      </>
    );
    await sleep(20);
    expect(renderTimes).toBe(1);

    expect(queue).toEqual([0, 1, 0]);

    dispose();
  });

  it("reactive filters is working", async () => {
    const queryClient = createQueryClient();
    const checkKey1 = signal(true);
    const key1 = queryKey();
    const key2 = queryKey();
    let renderTimes = 0;
    const { emit, queue, dispose } = queueSignal<number>();

    const Component1 = () => {
      const isFetching = useIsFetching$(() => ({
        queryKey: checkKey1.value ? key1 : key2,
      }));
      emit(untracked(isFetching));
      useSignalEffectOnce(() => {
        emit(isFetching());
      });

      renderTimes++;
      return null;
    };
    renderWithClient(
      queryClient,
      <>
        <Component1 />
        {createHooksComponentElement(() => {
          useQuery({
            queryKey: key1,
            queryFn: fetch10ms,
          });

          useQuery({
            queryKey: key2,
            queryFn: fetch10ms,
            enabled: !useSignalState(checkKey1),
          });
        })}
      </>
    );
    await sleep(20);

    expect(queue).toEqual([0, 1, 0]);
    checkKey1.value = false;
    await sleep(40);
    expect(renderTimes).toBe(1);

    expect(queue).toEqual([0, 1, 0, 1, 0]);

    dispose();
  });
});
