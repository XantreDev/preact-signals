import { QueryObserver } from "@tanstack/query-core";
import { createBaseQuery } from "./createBaseQuery$.ts";
import { UseQuery$ } from "./types.ts";

export const useQuery$ = createBaseQuery(QueryObserver) as UseQuery$;
