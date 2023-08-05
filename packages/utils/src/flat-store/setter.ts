import { batch } from "@preact-signals/unified-signals";
import { CreateFunction } from "../utils";
import { FlatStore } from "./createFlatStore";
type AnyRecord = Record<any, any>;

export type FlatStoreSetterFromStore<T extends FlatStore<AnyRecord>> =
  CreateFunction<
    [Partial<T extends FlatStore<infer TStore> ? TStore : never>],
    void
  >;

export type FlatStoreSetter<T extends AnyRecord> = CreateFunction<
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
