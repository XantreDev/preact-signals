import { ReadonlySignal } from "@preact-signals/unified-signals";
import { Accessor } from "@preact-signals/utils";
import {
    useInitSignal,
    useSignalEffectOnce,
    useSignalOfReactive,
} from "@preact-signals/utils/hooks";
import { useStore } from "@preact-signals/utils/flat-store";

type Dispose = () => void;

type Observer<T> = {
  getCurrent: () => T;
  subscribe: (emit: (value: T) => void) => Dispose;
};

export const useObserverSignal = <T>(
  createObserver: Accessor<Observer<T>>
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
  createObserverStore: Accessor<Observer<T>>
): T => {
  const observer = useSignalOfReactive(createObserverStore);
  const [store, setStore] = useStore(() => observer.value.getCurrent());

  useSignalEffectOnce(() => {
    setStore(observer.value.getCurrent());
  });

  useSignalEffectOnce(() => observer.value.subscribe(setStore));

  return store;
};
