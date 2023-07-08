import * as signals from "@preact/signals-core";
import { computed, signal } from "@preact/signals-core";

const callbackSignal = signal<null | (() => any)>(null);
const dummyContextComputed = computed(
  () => callbackSignal.value && callbackSignal.value()
);

type Untracked = <T>(callback: () => T) => T;
export const untracked: Untracked =
  (signals as { untracked?: Untracked }).untracked ??
  (<T>(callback: () => T): T => {
    callbackSignal.value = callback;
    try {
      return dummyContextComputed.peek();
    } finally {
      callbackSignal.value = null;
    }
  });
