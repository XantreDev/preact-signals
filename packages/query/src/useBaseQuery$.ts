import {
  useComputedOnce,
  useSignalEffectOnce,
  useSignalOfReactive,
} from "@preact-signals/hooks";
import type { QueryKey, QueryObserver } from "@tanstack/query-core";
import { useQueryClient$ } from "./react-query/QueryClientProvider";
import { useQueryErrorResetBoundary$ } from "./react-query/QueryErrorResetBoundary";
import { useClearResetErrorBoundary$ } from "./react-query/errorBoundaryUtils";
import { useIsRestoring$ } from "./react-query/isRestoring";
import { BaseQueryOptions$ } from "./types";
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
  ) => {
    const $options = useSignalOfReactive(options);
    const $queryClient = useQueryClient$({
      context: useComputedOnce(() => $options.value.context).value,
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
    useSignalEffectOnce(() => {
      $observer.value.setOptions($defaultedOptions.value);
    });

    const state = useObserverStore(() => ({
      getCurrent: () =>
        $observer.value.getOptimisticResult($defaultedOptions.value),
      subscribe: (emit) =>
        $observer.value.subscribe((newValue) => {
          emit(newValue);
        }),
    }));
    useClearResetErrorBoundary$(useQueryErrorResetBoundary$());

    // const [dataResource, { refetch, mutate }] = useResource({
    //   // this is not proper behavior
    //   fetcher: () =>
    //     state.isFetching || !state.isLoading
    //       ? neverResolves<typeof state.data>()
    //       : Object.assign({}, state.data),
    // });

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
