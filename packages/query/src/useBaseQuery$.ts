import { useComputedOnce, useSignalOfReactive } from "@preact-signals/hooks";
import type { QueryKey, QueryObserver } from "@tanstack/query-core";
import { useQueryClient$ } from "./react-query/QueryClientProvider";
import { useQueryErrorResetBoundary$ } from "./react-query/QueryErrorResetBoundary";
import { useIsRestoring$ } from "./react-query/isRestoring";
import { BaseQueryOptions$ } from "./types";

const emptyData = Symbol("empty");
export const useBaseQuery$ = <
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
  >,
  Observer: typeof QueryObserver
) => {
  const $options = useSignalOfReactive(options);
  const $queryClient = useQueryClient$({
    context: $options.value.context,
  });
  const $isRestoring = useIsRestoring$();
  const $defaultedOptions = useComputedOnce(() => {
    const defaulted = $queryClient.peek().defaultQueryOptions($options.peek());
    defaulted._optimisticResults = $isRestoring.value
      ? "isRestoring"
      : "optimistic";

    return defaulted;
  });
  const $observer = useComputedOnce(
    () => new Observer($queryClient.value, $defaultedOptions.peek())
  );
  const $errorResetBoundary = useQueryErrorResetBoundary$();
};
