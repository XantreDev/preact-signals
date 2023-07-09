import {
  ReadonlySignal,
  Signal,
  useComputed,
  useSignal,
} from "@preact/signals-react";
import { useRef } from "react";

export { useComputed, useSignal };
type AnyRecord = Record<any, any>;

export const createObject = <T extends AnyRecord>() => Object.create(null) as T;

const isSignal = <T>(value: T | ReadonlySignal<T>): value is Signal<T> =>
  value instanceof Signal;

export const useSignalOf = <T>(value: T) => {
  const signal = useSignal(value);
  if (signal.peek() !== value) {
    signal.value = value;
  }
  return signal;
};
export const useLiveSignal = <T>(maybeSignal: T | ReadonlySignal<T>) => {
  const signalValue = useSignal(maybeSignal);
  if (signalValue.peek() !== maybeSignal) {
    signalValue.value = maybeSignal;
  }
  return useComputed(() => {
    const value = signalValue.value;
    return isSignal(value) ? value.value : (value as T);
  });
};
export const useComputedOfAccessorOrSignal = <T>(
  accessorOrSignal: Reactive<T>
) => useComputed(toAccessor(accessorOrSignal));

const empty = Symbol("empty");
export const useConstant = <T>(fn: () => T) => {
  const ref = useRef<T | typeof empty>(empty);
  if (ref.current === empty) {
    ref.current = fn();
  }
  return ref.current;
};
