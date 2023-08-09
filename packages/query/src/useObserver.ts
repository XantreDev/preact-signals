import type { ReadonlySignal } from "@preact-signals/unified-signals";
import { ReadonlyFlatStore } from "@preact-signals/utils";
import {
    useFlatStore,
    useInitSignal,
    useSignalEffectOnce,
    useSignalOfReactive,
} from "@preact-signals/utils/hooks";

type Dispose = () => void;

type Observer<T> = {
  getCurrent: () => T;
  subscribe: (emit: (value: T) => void) => Dispose;
};

export const useObserverSignal = <T>(
  createObserver: () => Observer<T>
): ReadonlySignal<T> => {
  const observer = useSignalOfReactive(createObserver);
  const s = useInitSignal(() => observer.value.getCurrent());
  useSignalEffectOnce(() => {
    s.value = observer.value.getCurrent();
  });
  useSignalEffectOnce(() =>
    observer.value.subscribe((value) => {
      s.value = value;
    })
  );

  return s;
};

export const useObserverStore = <T extends Record<any, any>>(
  createObserverStore: () => Observer<T>
): ReadonlyFlatStore<T> => {
  const observer = useSignalOfReactive(createObserverStore);
  const [store, setStore] = useFlatStore(() => observer.value.getCurrent());

  useSignalEffectOnce(() => {
    setStore(observer.value.getCurrent());
  });

  useSignalEffectOnce(() => observer.value.subscribe(setStore));

  return store;
};
