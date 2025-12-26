/* istanbul ignore file */

// Side effects
import "./setBatchUpdatesFn.ts";

// Re-export core
export * from "@tanstack/query-core";

// React Query
export * from "./types.ts";
export { useQueries } from "./useQueries.ts";
export type { QueriesResults, QueriesOptions } from "./useQueries.ts";
export { useQuery } from "./useQuery.ts";
export {
  defaultContext,
  QueryClientProvider,
  useQueryClient,
  useQueryClient$,
} from "./QueryClientProvider.tsx";
export type { QueryClientProviderProps } from "./QueryClientProvider.tsx";
export type { QueryErrorResetBoundaryProps } from "./QueryErrorResetBoundary.tsx";
export { useHydrate, Hydrate } from "./Hydrate.tsx";
export type { HydrateProps } from "./Hydrate.tsx";
export {
  QueryErrorResetBoundary,
  useQueryErrorResetBoundary,
} from "./QueryErrorResetBoundary.tsx";
export { useIsFetching } from "./useIsFetching.ts";
export { useIsMutating } from "./useIsMutating.ts";
export { useMutation } from "./useMutation.ts";
export { useInfiniteQuery } from "./useInfiniteQuery.ts";
export { useIsRestoring, IsRestoringProvider } from "./isRestoring.tsx";
