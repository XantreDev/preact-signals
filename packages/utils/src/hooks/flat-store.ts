import { useMemo, useRef } from "react";
import { FlatStore, FlatStoreSetter, createFlatStore, createFlatStoreSetter } from "../flat-store";
import { untracked } from "../utils";
import { useSignalEffectOnce } from "./utility";

export type AnyRecord = Record<any, any>;

export const useStore = <T extends AnyRecord>(
  storeCreator: () => T
): [FlatStore<T>, FlatStoreSetter<T>] => {
  const storeRef = useRef<FlatStore<T> | null>();
  if (!storeRef.current) {
    storeRef.current = createFlatStore(untracked(storeCreator));
  }

  return [
    storeRef.current!,
    useMemo(() => createFlatStoreSetter(storeRef.current!), []),
  ];
};

export const useComputedStore$ = <T extends AnyRecord>(
  storeUpdater: () => T
) => {
  const [store, setStore] = useStore(storeUpdater);

  useSignalEffectOnce(() => {
    setStore(storeUpdater());
  });

  return store as Readonly<typeof store>;
};
