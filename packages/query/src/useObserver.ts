import { useInitSignal, useSignalEffectOnce } from "@preact-signals/hooks";
import { Accessor } from "@preact-signals/utils";
import { ReadonlySignal } from "@preact/signals-core";

type Dispose = () => void;

type Observer<T> = {
  getCurrent: () => T;
  subscribe: (emit: (value: T) => void) => Dispose;
};

export const useObserverSignal = <T>(
  observer: Accessor<Observer<T>>
): ReadonlySignal<T> => {
  const s = useInitSignal(() => observer().getCurrent());
  useSignalEffectOnce(() =>
    observer().subscribe((value) => {
      s.value = value;
    })
  );

  return s;
};
