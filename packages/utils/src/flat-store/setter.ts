import { batch } from "@preact-signals/unified-signals";
import { CreateFunction } from "../utils";
import { FlatStore } from "./createFlatStore";

export type FlatStoreSetter<T extends Record<any, any>> = CreateFunction<
  [Partial<T>],
  void
>;

export const createFlatStoreSetter =
  <T extends Record<any, any>>(store: FlatStore<T>): FlatStoreSetter<T> =>
  (newValue) => {
    batch(() => {
      for (const key in newValue) {
        // @ts-expect-error
        store[key] = newValue[key];
      }
    });
  };
