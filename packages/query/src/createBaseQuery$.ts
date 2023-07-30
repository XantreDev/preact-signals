import {
  useComputedOnce,
  useSignalEffectOnce,
  useSignalOfReactive,
} from "@preact-signals/utils/hooks";
import type {
  QueryKey,
  QueryObserver
} from "@tanstack/query-core";
import { useMemo } from "react";
import { useQueryClient$ } from "./react-query/QueryClientProvider";
import { useQueryErrorResetBoundary$ } from "./react-query/QueryErrorResetBoundary";
import {
  ensurePreventErrorBoundaryRetry,
  getHasError,
  useClearResetErrorBoundary$,
} from "./react-query/errorBoundaryUtils";
import { useIsRestoring$ } from "./react-query/isRestoring";
import { ensureStaleTime, shouldSuspend } from "./react-query/suspense";
import { BaseQueryOptions$, UseBaseQueryResult$ } from "./types";
import { useObserverStore } from "./useObserver";

export const createBaseQuery =
  (Observer: typeof QueryObserver) =>
  <
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey extends QueryKey = QueryKey
  >(
    options: BaseQueryOptions$<
      TQueryFnData,
      TError,
      TData,
      TQueryData,
      TQueryKey
    >
  ): UseBaseQueryResult$<TData, TError> => {
    const $options = useSignalOfReactive(options);
    const $queryClient = useQueryClient$({
      context: useComputedOnce(() => $options.value.context).value,
    });
    const $isRestoring = useIsRestoring$();
    const $errorBoundary = useQueryErrorResetBoundary$();
    const $defaultedOptions = useComputedOnce(() => {
      const defaulted = $queryClient.value.defaultQueryOptions($options.value);
      defaulted._optimisticResults = $isRestoring.value
        ? "isRestoring"
        : "optimistic";
      ensureStaleTime(defaulted);
      ensurePreventErrorBoundaryRetry(defaulted, $errorBoundary.value);

      return defaulted;
    });
    const $observer = useComputedOnce(
      () => new Observer($queryClient.value, $defaultedOptions.peek())
    );
    useSignalEffectOnce(() => {
      $observer.value.setOptions($defaultedOptions.value);
    });

    const state = useObserverStore(() => ({
      getCurrent: () =>
        $observer.value.getOptimisticResult(
          $defaultedOptions.value
        ) as UseBaseQueryResult$<TData, TError>,
      subscribe: (emit) =>
        $observer.value.subscribe((newValue) => {
          emit(newValue as UseBaseQueryResult$<TData, TError>);
        }),
    }));
    useClearResetErrorBoundary$($errorBoundary);

    const dataComputed = useComputedOnce(() => {
      if (
        getHasError({
          result: state,
          errorResetBoundary: $errorBoundary.value,
          query: $observer.value.getCurrentQuery(),
          useErrorBoundary: $defaultedOptions.value.useErrorBoundary,
        })
      ) {
        throw state.error;
      }
      if (shouldSuspend($defaultedOptions.value, state, $isRestoring.value)) {
        // will not refetch if already fetching
        // should suspend is not using data, so all will work fine
        throw $observer.value.fetchOptimistic($defaultedOptions.value);
      }
      return state.data;
    });
    state.dataSafe = undefined;
    return useMemo(
      () =>
        new Proxy(state, {
          get(target, prop) {
            if (prop === "data") {
              return dataComputed.value;
            }
            if (prop === "dataSafe") {
              return target.data;
            }
            // @ts-expect-error
            return Reflect.get(...arguments);
          },
        }),
      []
    );
  };
