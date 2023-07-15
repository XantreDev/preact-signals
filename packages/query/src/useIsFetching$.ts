import {
  Reactive,
  stableAccessorOfSignal,
  unwrapReactive,
} from "@preact-signals/utils";
import { QueryClient, QueryFilters } from "@tanstack/query-core";
import { ContextOptions } from "./react-query";
import { useQueryClient$ } from "./react-query/QueryClientProvider";
import { useObserverSignal } from "./useObserver";

const isFetching = (queryClient: QueryClient, filters: QueryFilters) =>
  queryClient.isFetching(filters);

export const useIsFetching$ = <T extends Reactive<QueryFilters>>(
  filters: T,
  options?: ContextOptions
) => {
  const $queryClient = useQueryClient$(options);
  const $queryCache = () => $queryClient.value.getQueryCache();

  const $isFetching = useObserverSignal(() => ({
    getCurrent: () => $queryClient.value.isFetching(unwrapReactive(filters)),
    subscribe: (emit) =>
      $queryCache().subscribe(() => {
        emit(isFetching($queryClient.value, unwrapReactive(filters)));
      }),
  }));

  return stableAccessorOfSignal($isFetching);
};
