import { effect } from "@preact/signals-react";

export type Untracked = <T>(callback: () => T) => T;
export const untrackedPolyfill: Untracked = <T>(callback: () => T): T => {
  let res: T | undefined;
  effect(() => () => {
    res = callback();
  })();

  return res!;
};
