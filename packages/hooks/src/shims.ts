import { ReadonlySignal, Signal, signal } from "@preact/signals-core";
import { useEffect, useRef } from "react";
import { Dispose } from ".";
import { useComputedOnce } from "./useComputedOnce";

export const useSignal = <T>(value: T) => {
  const signalRef = useRef<null | Signal<T>>(null);
  if (!signalRef.current) {
    signalRef.current = signal(value);
  }

  return signalRef.current!;
};

export const useComputed = <T>(compute: () => T): ReadonlySignal<T> => {
  const computeRef = useRef(compute);
  computeRef.current = compute;

  return /**__INLINE__ */ useComputedOnce(() => computeRef.current());
};

const EMPTY = [] as const;
export const useSignalEffect = (effectCallback: () => void | Dispose) => {
  const effectRef = useRef(effectCallback);
  if (effectRef.current !== effectCallback) {
    effectRef.current = effectCallback;
  }

  return useEffect(() => effectRef.current(), EMPTY);
};
