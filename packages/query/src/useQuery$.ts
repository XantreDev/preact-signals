import { QueryObserver } from "@tanstack/query-core";
import { createBaseQuery } from "./createBaseQuery$";
import {
  UseQuery$
} from "./types";

/**
 * @trackSignals
 */
export const useQuery$ = createBaseQuery(QueryObserver) as UseQuery$;
