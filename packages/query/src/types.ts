import { FlatStore, ReadonlyFlatStore } from "@preact-signals/utils/flat-store";
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
import { OverrideProperties, SetOptional } from "type-fest";
import type { ContextOptions } from "./react-query";

export type NotSupportedInQuery$ = "onError" | "onSettled" | "onSuccess";
export type SafeDataField<T> = { dataSafe: T | undefined };

// For some reason in cannot use Accessor in generic types, because it inherits wrong

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

export interface StaticQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> extends SetOptional<
    QueryObserverOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>,
    "queryKey"
  > {}

export type UseBaseQueryResult$<TData = unknown, TError = unknown> = FlatStore<
  QueryObserverResult<TData, TError> & SafeDataField<TData>
>;

export type UseQueryResult$<TData = unknown, TError = unknown> = FlatStore<
  UseBaseQueryResult$<TData, TError> & SafeDataField<TData>
>;

export type UseQuery$ = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: () => StaticQueryOptions<TQueryFnData, TError, TData, TQueryKey>
) => UseQueryResult$<TData, TError>;
export interface StaticInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> extends ContextOptions,
    SetOptional<
      InfiniteQueryObserverOptions<
        TQueryFnData,
        TError,
        TData,
        TQueryData,
        TQueryKey
      >,
      "queryKey"
    > {}

export type InfiniteQueryResult$<TData = unknown, TError = unknown> = FlatStore<
  InfiniteQueryObserverResult<TData, TError> & SafeDataField<TData>
>;

export type UseInfiniteQuery$ = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: () => StaticInfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey
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

export type StaticMutationResult<
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

export type UseMutationResult$<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
> = ReadonlyFlatStore<
  StaticMutationResult<TData, TError, TVariables, TContext>
>;
