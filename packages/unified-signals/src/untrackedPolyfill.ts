import * as signals from "@preact/signals-react";
import { Untracked } from "./type";

export const maybeUntracked = (signals as { untracked?: Untracked }).untracked;

const _polyfill = <T>(callback: () => T): T => {
  let res: T | undefined;
  signals.effect(() => () => {
    res = callback();
  })();

  return res!;
};

export const untrackedPolyfill: Untracked = maybeUntracked ?? _polyfill;
