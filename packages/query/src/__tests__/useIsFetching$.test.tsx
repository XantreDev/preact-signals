import { signal } from "@preact-signals/unified-signals";
import { untrackedPolyfill } from "@preact-signals/utils";
// @ts-expect-error
import { useSignalEffectOnce } from "@preact-signals/utils/hooks";
import React from "react";
import { describe, expect, it } from "vitest";
import { useQuery } from "../react-query";
import { useIsFetching$ } from "../useIsFetching$";
import {
  createHooksComponentElement,
  createQueryClient,
  fetchTime,
  queryKey,
  queueSignal,
  renderWithClient,
  sleep,
  useSignalState,
} from "./utils";

const fetch10ms = fetchTime(10);
describe("useIsFetching$", () => {
  it("should show current amount of fetching queries", async () => {
    const queryClient = createQueryClient();
    const key1 = queryKey();
    const key2 = queryKey();
    const { emit, queue, dispose } = queueSignal<number>();

    const Component1 = () => {
      const isFetching = useIsFetching$(() => null);
      emit(untrackedPolyfill(isFetching));
      useSignalEffectOnce(() => {
        emit(isFetching());
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

    expect(queue).toEqual([0, 1, 2, 1, 0]);

    dispose();
  });

  it("should be able to filter", async () => {
    const queryClient = createQueryClient();
    const key1 = queryKey();
    const key2 = queryKey();
    const { emit, queue, dispose } = queueSignal<number>();

    const Component1 = () => {
      const isFetching = useIsFetching$(() => ({
        queryKey: key1,
      }));
      emit(untrackedPolyfill(isFetching));
      useSignalEffectOnce(() => {
        emit(isFetching());
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
    expect(queue).toEqual([0, 1, 0]);

    dispose();
  });

  it("reactive filters is working", async () => {
    const queryClient = createQueryClient();
    const checkKey1 = signal(true);
    const key1 = queryKey();
    const key2 = queryKey();
    const { emit, queue, dispose } = queueSignal<number>();

    const Component1 = () => {
      const isFetching = useIsFetching$(() => ({
        queryKey: checkKey1.value ? key1 : key2,
      }));
      emit(untrackedPolyfill(isFetching));
      useSignalEffectOnce(() => {
        emit(isFetching());
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
            enabled: !useSignalState(checkKey1),
          });
        })}
      </>
    );
    await sleep(20);

    expect(queue).toEqual([0, 1, 0]);
    checkKey1.value = false;
    await sleep(40);

    expect(queue).toEqual([0, 1, 0, 1, 0]);

    dispose();
  });
  it("should be able to swap between actual filter and null", async () => {
    const checkAll = signal(true);
    const key1 = queryKey();
    const key2 = queryKey();
    const { emit, queue, dispose } = queueSignal<number>();

    renderWithClient(
      createQueryClient(),
      <>
        {createHooksComponentElement(() => {
          useQuery({
            queryKey: key1,
            queryFn: fetchTime(20),
          });

          useQuery({
            queryKey: key2,
            queryFn: fetchTime(20),
          });
        })}
        {createHooksComponentElement(() => {
          const isFetching = useIsFetching$(() =>
            checkAll.value
              ? null
              : {
                  predicate: () => false,
                }
          );
          emit(untrackedPolyfill(isFetching));
          useSignalEffectOnce(() => {
            emit(isFetching());
          });
        })}
      </>
    );

    expect(queue).toEqual([0, 2]);
    checkAll.value = false;
    expect(queue).toEqual([0, 2, 0]);

    dispose();
  });
});
