import {
  useInitSignal,
  useSignalEffectOnce,
  useSignalOfReactive,
} from "@preact-signals/hooks";
import { Accessor } from "@preact-signals/utils";
import { ReadonlySignal } from "@preact/signals-core";

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
