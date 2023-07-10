import { Reactive } from "@preact-signals/utils";
import {
    QueryClient,
    QueryKey,
    QueryObserverOptions,
} from "@tanstack/query-core";
import { Context } from "react";

export interface ContextOptions {
  /**
   * Use this to pass your Solid Query context. Otherwise, `defaultContext` will be used.
   */
  context?: Context<QueryClient | undefined>;
}

type PreactSignalQueryKey = () => unknown[];
type AnyPreactSignalQueryKey = () => any[];

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

export interface CreateQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends AnyPreactSignalQueryKey = PreactSignalQueryKey
> extends Omit<
    BaseQueryOptions$<
      TQueryFnData,
      TError,
      TData,
      TQueryFnData,
      ReturnType<TQueryKey>
    >,
    "queryKey"
  > {
  queryKey?: TQueryKey;
}
