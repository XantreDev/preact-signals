import * as signals from "@preact/signals-core";
import { computed, signal } from "@preact/signals-core";

const callbackSignal = signal<null | (() => any)>(null);
const dummyContextComputed = computed(
  () => callbackSignal.value && callbackSignal.value()
);
let untrackedDepth = 0;

type Untracked = <T>(callback: () => T) => T;
export const untracked: Untracked =
  (signals as { untracked?: Untracked }).untracked ??
  (<T>(callback: () => T): T => {
    if (untrackedDepth > 0) {
      return callback();
    }
    callbackSignal.value = callback;
    untrackedDepth++;
    try {
      return dummyContextComputed.peek();
    } finally {
      untrackedDepth--;
      callbackSignal.value = null;
    }
  });
