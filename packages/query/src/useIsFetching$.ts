import {
  Reactive,
  stableAccessorOfSignal,
  unwrapReactive,
} from "@preact-signals/utils";
import { QueryClient, QueryFilters } from "@tanstack/query-core";
import { EMPTY_OBJECT } from "./constants";
import { ContextOptions } from "./react-query";
import { useQueryClient$ } from "./react-query/QueryClientProvider";
import { useObserverSignal } from "./useObserver";

const isFetching = (queryClient: QueryClient, filters: QueryFilters) =>
  queryClient.isFetching(filters);

/**
 *
 * @param _filters pass null to get all queries
 * @param options
 * @returns
 */
export const useIsFetching$ = <T extends Reactive<QueryFilters | null>>(
  _filters: T,
  options?: ContextOptions
) => {
  const $queryClient = useQueryClient$(options);
  const $queryCache = () => $queryClient.value.getQueryCache();
  const filters = () => unwrapReactive(_filters) ?? EMPTY_OBJECT;

  const $isFetching = useObserverSignal(() => ({
    getCurrent: () => isFetching($queryClient.value, filters()),
    subscribe: (emit) =>
      $queryCache().subscribe(() => {
        emit(isFetching($queryClient.value, filters()));
      }),
  }));

  return $isFetching;
};
