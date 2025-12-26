import React, { useEffect, useReducer } from "react";
import { describe, expect, it, vi } from "vitest";
import { useMutation$ } from "../useMutation$.ts";
import { act } from "@testing-library/react";
import {
  createHooksComponentElement,
  createQueryClient,
  queueSignal,
  renderWithClient,
  sleep,
} from "./utils.tsx";
import { StaticMutationOptions } from "../types.ts";
import { signal } from "@preact-signals/unified-signals";
import { ErrorBoundary } from "react-error-boundary";

describe("useMutation$()", () => {
  it("should mutate", async () => {
    const mutationFn = vi.fn(() => Promise.resolve("data"));
    const onSuccess = vi.fn<[]>();
    const onRender = vi.fn();
    renderWithClient(
      createQueryClient(),
      <>
        {createHooksComponentElement(() => {
          const mutation = useMutation$(() => ({
            mutationFn: () => mutationFn(),
            onSuccess,
          }));
          // should not re-render
          onRender();

          useEffect(() => {
            mutation.mutate();
          }, []);
        })}
      </>
    );

    await sleep(1);
    expect(onRender).toHaveBeenCalledTimes(1);
    expect(mutationFn).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("should rerender if subscribed", async () => {
    const mutationFn = vi.fn(() => Promise.resolve("data"));
    const onSuccess = vi.fn<[]>();
    const statusQueue = queueSignal();
    const dataQueue = queueSignal();
    renderWithClient(
      createQueryClient(),
      <>
        {createHooksComponentElement(() => {
          const mutation = useMutation$(() => ({
            mutationFn: () => mutationFn(),
            onSuccess,
          }));
          // subscribing to mutation
          statusQueue.emit(mutation.status);
          dataQueue.emit(mutation.data);

          useEffect(() => {
            mutation.mutate();
          }, []);
        })}
      </>
    );

    await sleep(2);
    expect(statusQueue.queue).toEqual(["idle", "loading", "success"]);
    expect(mutationFn).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(dataQueue.queue).toEqual([undefined, "data"]);
    statusQueue.dispose();
    dataQueue.dispose();
  });

  it("test errorBoundary", async () => {
    const onErrorBoundary = vi.fn();
    renderWithClient(
      createQueryClient(),
      <ErrorBoundary fallbackRender={onErrorBoundary}>
        {createHooksComponentElement(() => {
          const mutation = useMutation$(() => ({
            mutationFn: () => sleep(10).then(() => Promise.reject(10)),
            useErrorBoundary: true,
          }));
          useEffect(() => {
            mutation.mutate();
          });
        })}
      </ErrorBoundary>
    );

    expect(onErrorBoundary).not.toHaveBeenCalled();
    await act(() => sleep(30));

    expect(onErrorBoundary).toHaveBeenCalled();
  });

  const useRerender = () => useReducer((acc) => acc + 1, 1)[1];

  it("paramFn be should reexecuted after each render (executeOptionsOnReferenceChange:true)", () => {
    const paramsFn = vi.fn(() => ({
      mutationFn: () => Promise.resolve(10),
      useOnlyReactiveUpdates: true,
    }));

    let rerender: () => void;
    renderWithClient(
      createQueryClient(),
      <>
        {createHooksComponentElement(() => {
          rerender = useRerender();
          useMutation$(() => paramsFn());
        })}
      </>
    );

    expect(paramsFn).toBeCalledTimes(1);

    act(() => {
      rerender();
    });

    expect(paramsFn).toBeCalledTimes(2);
  });

  it("paramFn be should reexecuted only after param is deps changed(executeOptionsOnReferenceChange:false)", () => {
    const dep = signal(0);
    const paramsFn = vi.fn(
      () =>
        ({
          mutationFn: () => Promise.resolve(10),
          executeOptionsOnReferenceChange: false,
          mutationKey: [dep.value],
        }) satisfies StaticMutationOptions<any, any, any, any>
    );

    let rerender: () => void;
    renderWithClient(
      createQueryClient(),
      <>
        {createHooksComponentElement(() => {
          rerender = useRerender();
          useMutation$(() => paramsFn());
        })}
      </>
    );

    expect(paramsFn).toBeCalledTimes(1);

    act(() => {
      rerender();
    });

    expect(paramsFn).toBeCalledTimes(1);

    act(() => {
      rerender();
    });

    expect(paramsFn).toBeCalledTimes(1);
    act(() => {
      dep.value++;
    });
    expect(paramsFn).toBeCalledTimes(2);
  });
});
