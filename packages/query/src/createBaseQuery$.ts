import {
  useComputedOnce,
  useSignalEffectOnce,
} from "@preact-signals/utils/hooks";
import type { QueryKey, QueryObserver } from "@tanstack/query-core";
import { useMemo } from "react";
import { useQueryClient$ } from "./react-query/QueryClientProvider.tsx";
import { useQueryErrorResetBoundary$ } from "./react-query/QueryErrorResetBoundary.tsx";
import {
  ensurePreventErrorBoundaryRetry,
  getHasError,
  useClearResetErrorBoundary$,
} from "./react-query/errorBoundaryUtils.ts";
import { useIsRestoring$ } from "./react-query/isRestoring.tsx";
import { ensureStaleTime, shouldSuspend } from "./react-query/suspense.ts";
import { StaticBaseQueryOptions, UseBaseQueryResult$ } from "./types.ts";
import { useObserverStore } from "./useObserver.ts";
import { useRefBasedOptions, wrapFunctionsInUntracked } from "./utils.ts";
import { untracked } from "@preact-signals/unified-signals";
import { $ } from "@preact-signals/utils";

const enum ReturnStatus {
  Error,
  Success,
  Suspense,
}

export const createBaseQuery =
  (Observer: typeof QueryObserver) =>
  <
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    options: () => StaticBaseQueryOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryData,
      TQueryKey
    >
  ): UseBaseQueryResult$<TData, TError> => {
    const $options = useRefBasedOptions(options);
    const $queryClient = useQueryClient$({
      context: useComputedOnce(() => $options.value.context).value,
    });
    const $isRestoring = useIsRestoring$();
    const $errorBoundary = useQueryErrorResetBoundary$();
    const $suspenseBehavior = $(
      () => $options.value.suspenseBehavior ?? "load-on-access"
    );
    const $defaultedOptions = useComputedOnce(() => {
      const defaulted = wrapFunctionsInUntracked(
        $queryClient.value.defaultQueryOptions($options.value)
      );

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
        $observer.value.getOptimisticResult( $defaultedOptions.value
        ) as UseBaseQueryResult$<TData, TError>,
      subscribe: (emit) =>
        $observer.value.subscribe((newValue) => {
          emit(newValue as UseBaseQueryResult$<TData, TError>);
        }),
    }));
    useClearResetErrorBoundary$($errorBoundary);

    const $shouldSuspend = $(() =>
      shouldSuspend($defaultedOptions.value, state, $isRestoring.value)
    );

    const getData = () => {
      if (
        getHasError({
          result: state,
          errorResetBoundary: $errorBoundary.value,
          query: $observer.value.getCurrentQuery(),
          useErrorBoundary: $defaultedOptions.value.useErrorBoundary,
        })
      ) {
        return {
          type: ReturnStatus.Error,
          data: state.error,
        } as const;
      }
      if ($shouldSuspend.value) {
        // will not refetch if already fetching
        // should suspend is not using data, so all will work fine
        return {
          type: ReturnStatus.Suspense,
          data: $observer.value.fetchOptimistic($defaultedOptions.value),
        } as const;
      }
      return {
        type: ReturnStatus.Success,
        data: state.data,
      } as const;
    };

    const dataComputed = useComputedOnce(() => {
      const res = getData();
      if (res.type === ReturnStatus.Success) {
        return res.data;
      }
      throw res.data;
    });
    untracked(() => {
      if (
        $shouldSuspend.value &&
        $suspenseBehavior.value !== "load-on-access"
      ) {
        const data = getData();
        if (
          data.type === ReturnStatus.Suspense &&
          $suspenseBehavior.value === "suspend-eagerly"
        ) {
          throw data.data;
        }
      }
    });

    const willSuspendOrThrow = useComputedOnce(() => {
      if (
        !$shouldSuspend.value ||
        $suspenseBehavior.value !== "suspend-eagerly"
      ) {
        return false;
      }

      return getData().type !== ReturnStatus.Success;
    });
    willSuspendOrThrow.value;

    // @ts-expect-error actually it can be written
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
