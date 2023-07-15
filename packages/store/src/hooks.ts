import { untracked } from "@preact-signals/utils";
import { useMemo, useRef } from "react";
import { createStore } from "./createStore";
import { createStoreSetter } from "./setStoreState";

export const useStore = <T extends Record<string | number, any>>(
  storeCreator: () => T
) => {
  const storeRef = useRef<T | null>();
  if (!storeRef.current) {
    storeRef.current = createStore(untracked(storeCreator));
  }

  return [
    storeRef.current!,
    useMemo(() => createStoreSetter(storeRef.current!), []),
  ] as const;
};

// export const useComputedStore$ = <T extends Record<string | number, any>>(
// storeUpdater: () => T
// ) => {
// const [store, setStore] = useStore(storeUpdater);
//
// useSignalEffectOnce(() => {
// setStore(storeUpdater());
// });
//
// return store as Readonly<typeof store>;
// };
//
