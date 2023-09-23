import { InfiniteQueryObserver, QueryObserver } from "@tanstack/query-core";
import { createBaseQuery } from "./createBaseQuery$";
import { UseInfiniteQuery$ } from "./types";

/**
 * @trackSignals
 */
export const useInfiniteQuery$ = createBaseQuery(
  InfiniteQueryObserver as typeof QueryObserver
) as UseInfiniteQuery$;
