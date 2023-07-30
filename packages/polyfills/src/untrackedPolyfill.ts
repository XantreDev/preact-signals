import * as signals from "@preact-signals/unified-signals";

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

export type Untracked = <T>(callback: () => T) => T;
export const untrackedPolyfill: Untracked =
  (signals as { untracked?: Untracked }).untracked ??
  (<T>(callback: () => T): T => {
    untrackedDepth++;
    try {
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
