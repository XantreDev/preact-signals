import type { FlatStore, ReadonlyFlatStore } from "@preact-signals/utils";
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
import { SetOptional } from "type-fest";
import type {
  ContextOptions,
  UseMutateAsyncFunction,
  UseMutateFunction,
} from "./react-query";

export type NotSupportedInQuery$ = "onError" | "onSettled" | "onSuccess";
export type SafeDataField<T> = { dataSafe: T | undefined };

// For some reason in cannot use Accessor in generic types, because it inherits wrong

export interface SuspenseBehaviorProp {
  /**
   * @description If `suspend-eagerly` - executes and suspends the query on mount. Helpful to be access data in `useEffect`/`useLayoutEffect` without handling loading state.
   * If `suspend-on-access` - executes query eagerly, but suspends the query on first access. Helpful to suspend child components if passing accessor as prop.
   * If `load-on-access` - executes query on first access. Helpful to load data only when needed.
   * @default `load-on-access`, will be changed to `suspend-on-access` in future
   */
  suspenseBehavior?: "suspend-eagerly" | "suspend-on-access" | "load-on-access";
}

export interface StaticBaseQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends ContextOptions,
    Omit<
      QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>,
      NotSupportedInQuery$
    >,
    ExecuteOptionsOnReferenceChangeProp,
    SuspenseBehaviorProp {}

export interface StaticQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends SetOptional<
      QueryObserverOptions<
        TQueryFnData,
        TError,
        TData,
        TQueryFnData,
        TQueryKey
      >,
      "queryKey"
    >,
    SuspenseBehaviorProp {}

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
  TQueryKey extends QueryKey = QueryKey,
>(
  options: () => StaticQueryOptions<TQueryFnData, TError, TData, TQueryKey>
) => UseQueryResult$<TData, TError>;
export interface StaticInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends ContextOptions,
    SuspenseBehaviorProp,
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
  TQueryKey extends QueryKey = QueryKey,
>(
  options: () => StaticInfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey
  >
) => InfiniteQueryResult$<TData, TError>;

export interface ExecuteOptionsOnReferenceChangeProp {
  /**
   * @description Controls how options callback will be reexecuted. If `true` - it will be reexecuted callback on every reference change. If `false` - it will not be reexecuted until reactive dependencies changed.
   * @default true
   */
  executeOptionsOnReferenceChange?: boolean;
}

export interface StaticMutationOptions<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> extends ContextOptions,
    Omit<
      MutationObserverOptions<TData, TError, TVariables, TContext>,
      "_defaulted" | "variables"
    >,
    ExecuteOptionsOnReferenceChangeProp {}

/**
 * @deprecated use `UseMutateFunction`
 */
export type MutationResultMutateFunction$<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> = (
  ...args: Parameters<MutateFunction<TData, TError, TVariables, TContext>>
) => void;

/**
 * @deprecated use `UseMutateAsyncFunction`
 */
export type MutationResultMutateAsyncFunction$<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> = MutateFunction<TData, TError, TVariables, TContext>;

export type StaticMutationResult<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> = Override<
  MutationObserverResult<TData, TError, TVariables, TContext>,
  {
    mutate: UseMutateFunction<TData, TError, TVariables, TContext>;
  } & {
    mutateAsync: UseMutateAsyncFunction<TData, TError, TVariables, TContext>;
  }
>;

type Override<A, B> = { [K in keyof A]: K extends keyof B ? B[K] : A[K] };

export type UseMutationResult$<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> = ReadonlyFlatStore<
  StaticMutationResult<TData, TError, TVariables, TContext>
>;
