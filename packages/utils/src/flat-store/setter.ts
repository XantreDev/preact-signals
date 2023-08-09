import { batch } from "@preact-signals/unified-signals";
import type { Except, ReadonlyKeysOf } from "type-fest";
import { FlatStore } from "./createFlatStore";

type AnyRecord = Record<any, any>;

export type FlatStoreSetterFromStore<T extends FlatStore<AnyRecord>> =
  FlatStoreSetter<T extends FlatStore<infer TRes> ? TRes : never>;

export type FlatStoreSetter<T extends AnyRecord> = (
  newValue: Except<T, ReadonlyKeysOf<T>>
) => void;

export const setterOfFlatStore =
  <T extends AnyRecord>(store: FlatStore<T>): FlatStoreSetter<T> =>
  (newValue) => {
    batch(() => {
      for (const key in newValue) {
        // @ts-expect-error
        store[key] = newValue[key];
      }
    });
  };
