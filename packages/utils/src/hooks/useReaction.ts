import { useEffect } from "react";
import { reaction } from "../utils";

export const useReaction: typeof reaction = (...args) =>
  // @ts-expect-error
  useEffect(() => reaction(...args), []);
