import { effect } from "@preact/signals-react";
import { Untracked } from "./type";

export const untrackedPolyfill: Untracked = <T>(callback: () => T): T => {
  let res: T | undefined;
  effect(() => () => {
    res = callback();
  })();

  return res!;
};
