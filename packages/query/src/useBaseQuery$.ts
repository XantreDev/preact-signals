import {
  useComputedOnce,
  useSignalEffectOnce,
  useSignalOfReactive,
} from "@preact-signals/hooks";
import { useStore } from "@preact-signals/store";
import { batch } from "@preact/signals-core";
import type { QueryKey, QueryObserver } from "@tanstack/query-core";
import { useRef } from "react";
import { useQueryClient$ } from "./react-query/QueryClientProvider";
import { useQueryErrorResetBoundary$ } from "./react-query/QueryErrorResetBoundary";
import { useClearResetErrorBoundary$ } from "./react-query/errorBoundaryUtils";
import { useIsRestoring$ } from "./react-query/isRestoring";
import { BaseQueryOptions$ } from "./types";

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
  ) => {
    const $options = useSignalOfReactive(options);
    const $queryClient = useQueryClient$({
      context: $options.value.context,
    });
    const $isRestoring = useIsRestoring$();
    const $defaultedOptions = useComputedOnce(() => {
      const defaulted = $queryClient.value.defaultQueryOptions($options.value);
      defaulted._optimisticResults = $isRestoring.value
        ? "isRestoring"
        : "optimistic";

      return defaulted;
    });
    const $observer = useComputedOnce(
      () => new Observer($queryClient.value, $defaultedOptions.peek())
    );
    const [state, setState] = useStore(() =>
      $observer.value.getOptimisticResult($defaultedOptions.value)
    );
    useSignalEffectOnce(() => {
      $observer.value.setOptions($defaultedOptions.value);
    });
    useClearResetErrorBoundary$(useQueryErrorResetBoundary$());

    // const [dataResource, { refetch, mutate }] = useResource({
    //   // this is not proper behavior
    //   fetcher: () =>
    //     state.isFetching || !state.isLoading
    //       ? neverResolves<typeof state.data>()
    //       : Object.assign({}, state.data),
    // });
    let latestTask = useRef<null | (() => void)>();

    useSignalEffectOnce(() => {
      const observer = $observer.value;
      observer.subscribe((result) => {
        latestTask.current = () =>
          batch(() => {
            setState(result);
            // console.log("new observer", result);
            // mutate(() => result.data);
            // refetch();
          });

        queueMicrotask(() => {
          if (!latestTask.current) {
            return;
          }

          latestTask.current();
          latestTask.current = null;
        });
      });

      return () => observer.destroy();
    });

    return state;
    // return useMemo(
    //   () =>
    //     new Proxy(state, {
    //       get(target, prop) {
    //         if (prop === "data") {
    //           return dataResource();
    //         }
    //         return Reflect.get(target, prop);
    //       },
    //     }),
    //   []
    // ) as QueryObserverResult<TData, TError>;
  };
