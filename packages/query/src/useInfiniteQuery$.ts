import {
  InfiniteQueryObserver,
  QueryObserver
} from "@tanstack/query-core";
import { createBaseQuery } from "./useBaseQuery$";
import { UseInfiniteQuery$ } from "./types";

export const useInfiniteQuery$ = createBaseQuery(
  InfiniteQueryObserver as typeof QueryObserver
) as UseInfiniteQuery$;
