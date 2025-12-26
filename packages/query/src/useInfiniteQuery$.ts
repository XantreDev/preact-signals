import { InfiniteQueryObserver, QueryObserver } from "@tanstack/query-core";
import { createBaseQuery } from "./createBaseQuery$.ts";
import { UseInfiniteQuery$ } from "./types.ts";

export const useInfiniteQuery$ = createBaseQuery(
  InfiniteQueryObserver as typeof QueryObserver
) as UseInfiniteQuery$;
