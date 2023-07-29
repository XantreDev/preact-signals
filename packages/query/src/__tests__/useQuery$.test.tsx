import { signal } from "@preact-signals/unified-signals";
import { untrackedPolyfill } from "@preact-signals/utils";
import React from "react";
// @ts-expect-error
import { Show } from "@preact-signals/utils/components";
// @ts-expect-error
import { useSignalEffectOnce } from "@preact-signals/utils/hooks";
import { render } from "@testing-library/react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { describe, expect, it, vi } from "vitest";
import { QueryClientProvider } from "../react-query";
import { useQuery$ } from "../useQuery$";
import {
  createHooksComponentElement,
  createQueryClient,
  fetchTime,
  queryKey,
  queueSignal,
  renderWithClient,
  sleep,
  sleepRaf,
} from "./utils";

describe("useQuery$()", () => {
  it("should fetch", async () => {
    const key = queryKey();
    const queryFn = vi.fn(fetchTime(10));
    const { emit, queue, dispose } = queueSignal();

    renderWithClient(
      createQueryClient(),
      <>
        {createHooksComponentElement(() => {
          const data = useQuery$(() => ({
            queryKey: key,
            queryFn,
          }));
          emit(untrackedPolyfill(() => data.data));
          useSignalEffectOnce(() => {
            emit(data.data);
          });
        })}
      </>
    );

    expect(queue).toEqual([undefined]);
    await sleepRaf(20);
    expect(queue).toEqual([undefined, "data"]);
    expect(queryFn).toHaveBeenCalledTimes(1);
    dispose();
  });
  it("should react to swap of query client", async () => {
    const key = queryKey();

    const queryFn = vi.fn(fetchTime(10));
    const { dispose, emit, queue } = queueSignal();
    const firstClient = createQueryClient();
    const secondClient = createQueryClient();
    const content = createHooksComponentElement(() => {
      const data = useQuery$(() => ({
        queryKey: key,
        queryFn,
      }));

      emit(untrackedPolyfill(() => data.data));
      useSignalEffectOnce(() => {
        emit(data.data);
      });
    });
    const { rerender } = render(
      <QueryClientProvider client={firstClient}>{content}</QueryClientProvider>
    );

    expect(queue).toEqual([undefined]);
    await sleepRaf(20);
    expect(queue).toEqual([undefined, "data"]);

    rerender(
      <QueryClientProvider client={secondClient}>{content}</QueryClientProvider>
    );
    await sleepRaf(20);
    expect(queue).toEqual([undefined, "data", undefined, "data"]);
    expect(queryFn).toHaveBeenCalledTimes(2);
    dispose();
  });
  it("query options is reactive", async () => {
    const key = queryKey();

    const queryFn = fetchTime(10);
    const isEnabled = signal(false);
    const { dispose, emit, queue } = queueSignal();
    const toState = (data: Record<any, any>) => ({
      data: data.data,
      status: data.status,
      isFetching: data.isFetching,
    });
    renderWithClient(
      createQueryClient(),
      <>
        {createHooksComponentElement(() => {
          const data = useQuery$(() => ({
            queryKey: key,
            queryFn,
            enabled: isEnabled.value,
          }));

          emit(untrackedPolyfill(() => toState(data)));
          useSignalEffectOnce(() => {
            emit(toState(data));
          });
        })}
      </>
    );

    await sleepRaf(20);
    expect(queue).toEqual([
      {
        data: undefined,
        isFetching: false,
        status: "loading",
      },
      // double emit because of useSignalEffectOnce
      {
        data: undefined,
        isFetching: false,
        status: "loading",
      },
    ]);
    isEnabled.value = true;
    await sleepRaf(20);

    expect(queue).toEqual([
      {
        data: undefined,
        isFetching: false,
        status: "loading",
      },
      {
        data: undefined,
        isFetching: false,
        status: "loading",
      },
      {
        data: undefined,
        isFetching: true,
        status: "loading",
      },
      {
        data: "data",
        isFetching: false,
        status: "success",
      },
    ]);
    dispose();
  });

  describe("suspense", () => {
    it("should not suspend if not used", async () => {
      const S = vi.fn(() => null);
      const key = queryKey();
      let renderTimes = 0;
      renderWithClient(
        createQueryClient(),
        <Suspense fallback={<S />}>
          {createHooksComponentElement(() => {
            renderTimes++;
            useQuery$(() => ({
              queryKey: key,
              suspense: true,
              queryFn: () => sleep(5).then(() => "data"),
            }));
          })}
        </Suspense>
      );

      expect(renderTimes).toBe(1);
      expect(S).not.toHaveBeenCalled();

      await sleepRaf(10);

      expect(renderTimes).toBe(1);
      expect(S).not.toHaveBeenCalled();
    });

    it("should suspend if used", async () => {
      const S = vi.fn(() => null);
      const key = queryKey();
      let renderTimes = 0;
      const queue = queueSignal();
      renderWithClient(
        createQueryClient(),
        <Suspense fallback={<S />}>
          {createHooksComponentElement(() => {
            renderTimes++;

            queue.emit(
              useQuery$(() => ({
                queryKey: key,
                suspense: true,
                queryFn: () => sleep(5).then(() => "data"),
              })).data
            );
          })}
        </Suspense>
      );

      expect(renderTimes).toBe(1);
      expect(queue.queue).toEqual([]);
      expect(S).toHaveBeenCalledOnce();

      await sleepRaf(20);

      expect(renderTimes).toBe(2);
      expect(queue.queue).toEqual(["data"]);
      expect(S).toHaveBeenCalledOnce();
      queue.dispose();
    });

    it("if throws should suspend and throw to ErrorBoundary", async () => {
      const S = vi.fn(() => null);
      const EB = vi.fn(() => null);
      const queryFn = vi.fn(async (): Promise<string> => {
        await sleepRaf(5);

        return Promise.reject("error");
      });
      const key = queryKey();
      const queue = queueSignal();
      const errorQueue = queueSignal();
      const C = vi.fn(() => {
        const query = useQuery$(() => ({
          queryKey: key,
          suspense: true,
          tseErrorBoundary: true,

          queryFn,
          retry: false,
        }));
        errorQueue.emit(query.error);
        queue.emit(query.data);

        return null;
      });
      renderWithClient(
        createQueryClient(),
        <Suspense fallback={<S />}>
          <ErrorBoundary fallbackRender={EB}>
            <C />
          </ErrorBoundary>
        </Suspense>
      );

      expect(queryFn).toHaveBeenCalledOnce();
      expect(C).toHaveBeenCalledOnce();
      expect(EB).not.toHaveBeenCalled();
      expect(queue.queue).toEqual([]);
      expect(S).toHaveBeenCalledOnce();
      expect(errorQueue.queue).toEqual([null]);

      await sleepRaf(60);

      expect(queryFn).toHaveBeenCalledOnce();
      // react randomly reexecute EB components, there's no guaranty
      expect(EB).toHaveBeenCalled();
      expect(C.mock.calls.length).toBeGreaterThan(2);
      expect(queue.queue).toEqual([]);
      expect(errorQueue.queue).toEqual([null, "error"]);
      expect(S).toHaveBeenCalledOnce();

      queue.dispose();
      errorQueue.dispose();
    });

    it("should allow scoped suspense", async () => {
      const S = vi.fn(() => null);
      const NestedSuspense = vi.fn(() => null);
      const key = queryKey();
      const showRenderer = vi.fn((data: string) => <div>{data}</div>);
      const C = vi.fn(() => {
        const query = useQuery$<string>(() => ({
          queryKey: key,
          suspense: true,
          queryFn: () => sleep(5).then(() => "data"),
        }));

        return (
          <>
            <Suspense fallback={<NestedSuspense />}>
              <Show when={() => query.data}>{showRenderer}</Show>
            </Suspense>
          </>
        );
      });
      renderWithClient(
        createQueryClient(),
        <Suspense fallback={<S />}>
          <C />
        </Suspense>
      );

      expect(C).toHaveBeenCalledOnce();
      expect(S).not.toHaveBeenCalled();
      expect(NestedSuspense).toHaveBeenCalledOnce();
      expect(showRenderer).not.toHaveBeenCalled();

      await sleepRaf(10);

      expect(NestedSuspense).toHaveBeenCalledOnce();
      expect(S).not.toHaveBeenCalled();
      expect(showRenderer).toHaveBeenCalledWith("data");
    });
  });
});
