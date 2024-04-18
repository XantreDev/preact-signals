import {
  useComputedOnce,
  useSignalEffectOnce,
  useSignalOfReactive,
} from "@preact-signals/utils/hooks";
import { MutationObserver, MutationObserverResult } from "@tanstack/query-core";
import { useEffect, useMemo, useRef } from "react";
import { useQueryClient$ } from "./react-query/QueryClientProvider";
import {
  MutationResultMutateFunction$,
  StaticMutationOptions,
  StaticMutationResult,
  UseMutationResult$,
} from "./types";
import { useObserverStore } from "./useObserver";
import { EMPTY_ARRAY, wrapFunctionsInUntracked } from "./utils";
import { untracked } from "@preact-signals/unified-signals";

function noop() {}

export const useMutation$ = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(
  options: () => StaticMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult$<TData, TError, TVariables, TContext> => {
  const $options = useSignalOfReactive(options);
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
  const mutate: MutationResultMutateFunction$<
    TData,
    TError,
    TVariables,
    TContext
  > = useMemo(
    () => (variables, mutateOptions) =>
      void observer.peek().mutate(variables, mutateOptions).catch(noop),
    EMPTY_ARRAY
  );

  const unwrapParamsInRender = useRef(!$options.peek().useOnlyReactiveUpdates);
  const executionCounter = useRef(0);
  const optionsOrNull = useMemo(() => {
    if (!unwrapParamsInRender.current) {
      return null;
    }
    if (executionCounter.current++ === 0) {
      return $options.peek();
    }
    return untracked(options);
  }, [options]);
  if (optionsOrNull) {
    unwrapParamsInRender.current = !optionsOrNull.useOnlyReactiveUpdates;
  }

  useSignalEffectOnce(() => {
    unwrapParamsInRender.current = !$options.value.useOnlyReactiveUpdates;
    if (unwrapParamsInRender.current) {
      return;
    }
    observer.value.setOptions(wrapFunctionsInUntracked($options.value));
  });
  useEffect(() => {
    if (!unwrapParamsInRender.current && optionsOrNull) {
      observer.value.setOptions(wrapFunctionsInUntracked(optionsOrNull));
    }
  }, [optionsOrNull]);

  const observerResultToStore = (
    result: MutationObserverResult<TData, TError, TVariables, TContext>
  ) =>
    ({
      ...result,
      mutate,
      mutateAsync: result.mutate,
    }) as StaticMutationResult<TData, TError, TVariables, TContext>;

  const store = useObserverStore(() => ({
    getCurrent: () => observerResultToStore(observer.value.getCurrentResult()),
    subscribe: (emit) =>
      observer.value.subscribe((newValue) => {
        emit(observerResultToStore(newValue));
      }),
  }));

  return store;
};
