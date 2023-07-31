import { Accessor } from "@preact-signals/utils";
import {
  useComputedOnce,
  useSignalEffectOnce,
  useSignalOfReactive,
} from "@preact-signals/utils/hooks";
import { MutationObserver, MutationObserverResult } from "@tanstack/query-core";
import { useMemo } from "react";
import { EMPTY_ARRAY } from "./constants";
import { useQueryClient$ } from "./react-query/QueryClientProvider";
import {
  MutationResult$,
  MutationResultMutateFunction$,
  StaticMutationOptions,
} from "./types";
import { useObserverStore } from "./useObserver";

function noop() {}

export const useMutation$ = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  options: Accessor<StaticMutationOptions<TData, TError, TVariables, TContext>>
): MutationResult$<TData, TError, TVariables, TContext> => {
  const $options = useSignalOfReactive(options);
  const $client = useQueryClient$({
    context: useComputedOnce(() => $options.value.context).value,
  });

  const observer = useComputedOnce(
    // we will update current mutation observer with new options, so using `peek`
    () => new MutationObserver($client.value, $options.peek())
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

  useSignalEffectOnce(() => {
    observer.value.setOptions($options.value);
  });

  const observerResultToStore = (
    result: MutationObserverResult<TData, TError, TVariables, TContext>
  ) =>
    ({
      ...result,
      mutate,
      mutateAsync: result.mutate,
    } as MutationResult$<TData, TError, TVariables, TContext>);

  const store = useObserverStore(() => ({
    getCurrent: () => observerResultToStore(observer.value.getCurrentResult()),
    subscribe: (emit) =>
      observer.value.subscribe((newValue) => {
        emit(observerResultToStore(newValue));
      }),
  }));

  return store;
};
