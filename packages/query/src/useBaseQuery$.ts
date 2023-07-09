import {
  useComputedOnce,
  useSignalOfReactive,
  useSignalOfState,
} from "@preact-signals/hooks";
import { ReadonlySignal } from "@preact/signals-core";
import type { QueryKey } from "@tanstack/query-core";
import {
  useIsRestoring,
  useQueryClient,
  useQueryErrorResetBoundary,
} from "@tanstack/react-query";
import { BaseQueryOptions$, StaticBaseQueryOptions } from "./types";

export const useBaseQuery$ = <
  TQueryFnData,
  TError,
  TData,
  TQueryData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: BaseQueryOptions$<TQueryFnData, TError, TData, TQueryData, TQueryKey>
) => {
  const options$ = useSignalOfReactive(options) as ReadonlySignal<
    StaticBaseQueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>
  >;
  const queryClient = useSignalOfState(
    useQueryClient({
      context: useComputedOnce(() => options$.value.context).value,
    })
  );
  const isRestoring = useSignalOfState(useIsRestoring());
  const errorResetBoundary = useSignalOfState(useQueryErrorResetBoundary());
};
