import * as signals from "@preact/signals-react";
import { Untracked } from "./type";

export const maybeUntracked = (signals as { untracked?: Untracked }).untracked;

let untrackedDepth = 0;

const untrackedEffect = <T>(callback: () => T): T => {
  let isExecuted = false;
  let res: T | undefined;
  signals.effect(() => {
    if (isExecuted) {
      return;
    }
    try {
      res = callback();
    } finally {
      isExecuted = true;
    }
  })();

  return res!;
};

export const untrackedPolyfill: Untracked =
  maybeUntracked ??
  (<T>(callback: () => T): T => {
    untrackedDepth++;
    try {
      // @ts-expect-error process is not defined and bla bla bla
      if (process.env.NODE_ENV === "development" && untrackedDepth > 100_000) {
        throw new Error("untracked depth exceeded: 100_000");
      }
      if (untrackedDepth > 1) {
        return callback();
      }
      return untrackedEffect(callback);
    } finally {
      untrackedDepth--;
    }
  });
