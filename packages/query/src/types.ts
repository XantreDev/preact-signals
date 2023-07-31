import type { Accessor } from "@preact-signals/utils";
import type {
  InfiniteQueryObserverOptions,
  InfiniteQueryObserverResult,
  MutateFunction,
  MutationObserverOptions,
  MutationObserverResult,
  QueryKey,
  QueryObserverOptions,
  QueryObserverResult,
} from "@tanstack/query-core";
import { OverrideProperties } from "type-fest";
import type { ContextOptions } from "./react-query";

export type NotSupportedInQuery$ = "onError" | "onSettled" | "onSuccess";
export type SafeDataField<T> = { dataSafe: T | undefined };

export type Remove<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface StaticBaseQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> extends ContextOptions,
    Omit<
      QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>,
      NotSupportedInQuery$
    > {}

export type BaseQueryOptions$<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> = Accessor<
  StaticBaseQueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>
>;

export interface StaticQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> extends Omit<
    QueryObserverOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>,
    "queryKey"
  > {
  queryKey?: TQueryKey;
}

export type UseBaseQueryResult$<
  TData = unknown,
  TError = unknown
> = QueryObserverResult<TData, TError> & SafeDataField<TData>;

export type UseQueryResult$<
  TData = unknown,
  TError = unknown
> = UseBaseQueryResult$<TData, TError> & SafeDataField<TData>;

export type UseQuery$ = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: Accessor<StaticQueryOptions<TQueryFnData, TError, TData, TQueryKey>>
) => QueryObserverResult<TData, TError> & SafeDataField<TData>;
export interface StaticInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
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

export type InfiniteQueryResult$<
  TData = unknown,
  TError = unknown
> = InfiniteQueryObserverResult<TData, TError> & SafeDataField<TData>;

export type UseInfiniteQuery$ = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: Accessor<
    StaticInfiniteQueryOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryData,
      TQueryKey
    >
  >
) => InfiniteQueryResult$<TData, TError>;

export interface StaticMutationOptions<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
> extends ContextOptions,
    Omit<
      MutationObserverOptions<TData, TError, TVariables, TContext>,
      "_defaulted" | "variables"
    > {}

export type MutationResultMutateFunction$<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
> = (
  ...args: Parameters<MutateFunction<TData, TError, TVariables, TContext>>
) => void;

export type MutationResultMutateAsyncFunction$<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
> = MutateFunction<TData, TError, TVariables, TContext>;

export type MutationResult$<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
> = OverrideProperties<
  MutationObserverResult<TData, TError, TVariables, TContext>,
  {
    mutate: MutationResultMutateFunction$<TData, TError, TVariables, TContext>;
  }
> & {
  mutateAsync: MutationResultMutateAsyncFunction$<
    TData,
    TError,
    TVariables,
    TContext
  >;
};
