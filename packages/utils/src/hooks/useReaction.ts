import { useEffect } from "react";
import { reaction } from "../utils";

/**
 * creates reaction on mount and dispose on unmount
 */
export const useReaction: typeof reaction = (...args) =>
  // @ts-expect-error
  useEffect(() => reaction(...args), []);
