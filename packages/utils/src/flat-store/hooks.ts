import { useMemo, useRef } from "react";
import { useSignalEffectOnce } from "../hooks";
import { untrackedPolyfill } from "../utils";
import { FlatStore, createFlatStore } from "./createFlatStore";
import { FlatStoreSetter, createFlatStoreSetter } from "./setter";

export const useStore = <T extends Record<string | number, any>>(
  storeCreator: () => T
): [FlatStore<T>, FlatStoreSetter<T>] => {
  const storeRef = useRef<FlatStore<T> | null>();
  if (!storeRef.current) {
    storeRef.current = createFlatStore(untrackedPolyfill(storeCreator));
  }

  return [
    storeRef.current!,
    useMemo(() => createFlatStoreSetter(storeRef.current!), []),
  ];
};

export const useComputedStore$ = <T extends Record<string | number, any>>(
  storeUpdater: () => T
) => {
  const [store, setStore] = useStore(storeUpdater);

  useSignalEffectOnce(() => {
    setStore(storeUpdater());
  });

  return store as Readonly<typeof store>;
};
