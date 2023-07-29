import { QueryObserver, QueryObserverResult } from "@tanstack/query-core";
import { createBaseQuery } from "./createBaseQuery$";
import {
  AnyPreactSignalQueryKey,
  PreactSignalQueryKey,
  QueryOptions$,
  SafeDataField,
} from "./types";

export type UseQuery$ = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends AnyPreactSignalQueryKey = PreactSignalQueryKey
>(
  options: QueryOptions$<TQueryFnData, TError, TData, TQueryKey>
) => QueryObserverResult<TData, TError> & SafeDataField<TData>;

export const useQuery$ = createBaseQuery(QueryObserver) as UseQuery$;
