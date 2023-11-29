import { WritableUncached } from "../$";
import type { Signal } from "@preact-signals/unified-signals";

export const propSignal = <T extends Record<any, any>, K extends keyof T>(
  obj: Signal<T>,
  key: K
): WritableUncached<T[K]> =>
  new WritableUncached(
    () => obj.value[key],
    (value) =>
      (obj.value = {
        ...obj.value,
        [key]: value,
      })
  );
