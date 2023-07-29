import { batch } from "@preact-signals/unified-signals";

export const createStoreSetter =
  <T extends Record<string | number, any>>(store: T) =>
  (newValue: Partial<T>) => {
    batch(() => {
      for (const key in newValue) {
        // @ts-expect-error
        store[key] = newValue[key];
      }
    });
  };
