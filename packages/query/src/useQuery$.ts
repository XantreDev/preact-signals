import { QueryObserver, QueryObserverResult } from "@tanstack/query-core";
import {
  AnyPreactSignalQueryKey,
  PreactSignalQueryKey,
  QueryOptions$,
} from "./types";
import { createBaseQuery } from "./useBaseQuery$";

type UseQuery$ = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends AnyPreactSignalQueryKey = PreactSignalQueryKey
>(
  options: QueryOptions$<TQueryFnData, TError, TData, TQueryKey>
) => QueryObserverResult<TData, TError>;

export const useQuery$ = createBaseQuery(QueryObserver) as UseQuery$;
