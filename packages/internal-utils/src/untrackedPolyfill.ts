import * as signals from "@preact/signals-react";
import { computed, signal } from "@preact/signals-react";

const callbackSignal = signal<null | (() => any)>(null);
const dummyContextComputed = computed(
  () => callbackSignal.value && callbackSignal.value()
);
let untrackedDepth = 0;

export type Untracked = <T>(callback: () => T) => T;
export const untrackedPolyfill: Untracked =
  (signals as { untracked?: Untracked }).untracked ??
  (<T>(callback: () => T): T => {
    if (untrackedDepth > 0) {
      return callback();
    }
    signals.effect(() => {
      callbackSignal.value = callback;
    })();
    untrackedDepth++;
    try {
      return dummyContextComputed.peek();
    } finally {
      untrackedDepth--;
      signals.effect(() => {
        callbackSignal.value = null;
      })();
    }
  });
