import { useRef } from "react";
import { createFlatStore, createFlatStoreOfSignals } from "../flat-store";
import { untracked } from "../utils";
import { useSignalEffectOnce } from "./utility";

export type AnyRecord = Record<any, any>;

/**
 * Create a flat store and its setter.
 */
export const useFlatStore = <T extends AnyRecord>(storeCreator: () => T) => {
  const storeRef = useRef<ReturnType<typeof createFlatStore<T>> | null>();
  if (!storeRef.current) {
    storeRef.current = createFlatStore(untracked(storeCreator));
  }

  return storeRef.current;
};

export const useFlatStoreOfSignals = <T extends AnyRecord>(
  storeCreator: () => T
) => {
  const storeRef = useRef<ReturnType<
    typeof createFlatStoreOfSignals<T>
  > | null>();
  if (!storeRef.current) {
    storeRef.current = createFlatStoreOfSignals(untracked(storeCreator));
  }

  return storeRef.current;
};

export const useComputedFlatStore = <T extends AnyRecord>(
  storeUpdater: () => T
) => {
  const [store, setStore] = useFlatStore(storeUpdater);

  useSignalEffectOnce(() => {
    setStore(storeUpdater());
  });

  return store as Readonly<typeof store>;
};
