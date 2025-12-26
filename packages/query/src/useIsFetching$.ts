import { Reactive, unwrapReactive } from "@preact-signals/utils";
import { QueryClient, QueryFilters } from "@tanstack/query-core";
import { ContextOptions } from "./react-query/index.ts";
import { useQueryClient$ } from "./react-query/QueryClientProvider.tsx";
import { useObserverSignal } from "./useObserver.ts";
import { EMPTY_OBJECT } from "./utils.ts";
import { ReadonlySignal } from "@preact/signals-core";

const isFetching = (queryClient: QueryClient, filters: QueryFilters) =>
  queryClient.isFetching(filters);

/**
 *
 * @param _filters pass null to get all queries
 * @param options
 * @returns
 *
 */
export const useIsFetching$ = <T extends Reactive<QueryFilters | null>>(
  _filters: T,
  options?: ContextOptions
): ReadonlySignal<number> => {
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
