import type { Reactive } from "@preact-signals/utils";
import type {
  InfiniteQueryObserverOptions,
  InfiniteQueryObserverResult,
  QueryKey,
  QueryObserverOptions,
} from "@tanstack/query-core";
import type { ContextOptions } from "./react-query";

export type PreactSignalQueryKey = unknown[];
export type AnyPreactSignalQueryKey = any[];

export interface StaticBaseQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> extends ContextOptions,
    QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey> {}

export type BaseQueryOptions$<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> = Reactive<
  StaticBaseQueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>
>;

export interface StaticQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends AnyPreactSignalQueryKey = PreactSignalQueryKey
> extends Omit<
    BaseQueryOptions$<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>,
    "queryKey"
  > {
  queryKey?: TQueryKey;
}

export type QueryOptions$<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends AnyPreactSignalQueryKey = PreactSignalQueryKey
> = Reactive<StaticQueryOptions<TQueryFnData, TError, TData, TQueryKey>>;

export interface StaticInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends PreactSignalQueryKey = PreactSignalQueryKey
> extends ContextOptions,
    Omit<
      InfiniteQueryObserverOptions<
        TQueryFnData,
        TError,
        TData,
        TQueryData,
        TQueryKey
      >,
      "queryKey"
    > {
  queryKey?: TQueryKey;
}

export type InfiniteQueryOptions$<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends PreactSignalQueryKey = PreactSignalQueryKey
> = Reactive<
  StaticInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>
>;

export type InfiniteQueryResult<
  TData = unknown,
  TError = unknown
> = InfiniteQueryObserverResult<TData, TError>;

export type UseInfiniteQuery$ = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends PreactSignalQueryKey = PreactSignalQueryKey
>(
  options: InfiniteQueryOptions$<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey
  >
) => InfiniteQueryResult<TData, TError>;
