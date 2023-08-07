import { useRef } from "react";
import { createFlatStore } from "../flat-store";
import { untracked } from "../utils";
import { useSignalEffectOnce } from "./utility";

export type AnyRecord = Record<any, any>;

/**
 * Create a flat store and its setter.
 */
export const useStore = <T extends AnyRecord>(storeCreator: () => T) => {
  const storeRef = useRef<ReturnType<typeof createFlatStore<T>> | null>();
  if (!storeRef.current) {
    storeRef.current = createFlatStore(untracked(storeCreator));
  }

  return storeRef.current;
};

export const useComputedStore = <T extends AnyRecord>(
  storeUpdater: () => T
) => {
  const [store, setStore] = useStore(storeUpdater);

  useSignalEffectOnce(() => {
    setStore(storeUpdater());
  });

  return store as Readonly<typeof store>;
};
