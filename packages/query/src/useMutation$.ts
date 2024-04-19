import { useComputedOnce } from "@preact-signals/utils/hooks";
import { MutationObserver, MutationObserverResult } from "@tanstack/query-core";
import { useMemo, useState } from "react";
import { useQueryClient$ } from "./react-query/QueryClientProvider";
import {
  StaticMutationOptions,
  StaticMutationResult,
  UseMutationResult$,
} from "./types";
import { useObserverStore } from "./useObserver";
import {
  EMPTY_ARRAY,
  useRefBasedOptions,
  wrapFunctionsInUntracked,
} from "./utils";
import { untracked, useSignalEffect } from "@preact-signals/unified-signals";
import { UseMutateFunction } from "./react-query";

function noop() {}

export const useMutation$ = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(
  options: () => StaticMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult$<TData, TError, TVariables, TContext> => {
  const $options = useRefBasedOptions(options);
  const $client = useQueryClient$({
    context: useComputedOnce(() => $options.value.context).value,
  });

  const observer = useComputedOnce(
    // we will update current mutation observer with new options, so using `peek`
    () =>
      new MutationObserver(
        $client.value,
        wrapFunctionsInUntracked($options.peek())
      )
  );
  useSignalEffect(() => {
    observer.value.setOptions(wrapFunctionsInUntracked($options.value));
  });
  const mutate: UseMutateFunction<TData, TError, TVariables, TContext> =
    useMemo(
      () => (variables, mutateOptions) =>
        void observer.peek().mutate(variables, mutateOptions).catch(noop),
      EMPTY_ARRAY
    );

  const observerResultToStore = (
    result: MutationObserverResult<TData, TError, TVariables, TContext>
  ) =>
    ({
      ...result,
      mutate,
      mutateAsync: result.mutate,
    }) as unknown as StaticMutationResult<TData, TError, TVariables, TContext>;

  const store = useObserverStore(() => ({
    getCurrent: () => observerResultToStore(observer.value.getCurrentResult()),
    subscribe: (emit) =>
      observer.value.subscribe((newValue) => {
        emit(observerResultToStore(newValue));
      }),
  }));

  return store;
};
