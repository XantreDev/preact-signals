import * as signals from "@preact/signals-react";

// const callbackSignal = signal<null | (() => any)>(null);
// const dummyContextComputed = computed(
//   () => callbackSignal.value && callbackSignal.value()
// );
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
    if (untrackedDepth > 0) {
      return callback();
    }
    // signals.effect(() => {
    //   callbackSignal.value = callback;
    // })();
    untrackedDepth++;
    try {
      return untrackedEffect(callback);
      // return dummyContextComputed.peek();
    } finally {
      untrackedDepth--;
      // signals.effect(() => {
      //   callbackSignal.value = null;
      // })();
    }
  });
