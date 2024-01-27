import { ReadonlySignal, Signal, useComputed, useSignal } from "@preact-signals/unified-signals";
import { useRef } from "react";

const isSignal = <T>(value: T | ReadonlySignal<T>): value is Signal<T> =>
  value instanceof Signal;

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

const empty = Symbol("empty");
export const useConstant = <T>(fn: () => T) => {
  const ref = useRef<T | typeof empty>(empty);
  if (ref.current === empty) {
    ref.current = fn();
  }
  return ref.current;
};
