import {
  ReadonlySignal,
  Signal,
  computed,
  effect,
  signal,
} from "@preact/signals-core";
import { useEffect, useMemo, useRef } from "react";

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

  return useMemo(() => computed(() => computeRef.current()), EMPTY);
};
type Dispose = () => void;

const EMPTY = [] as const;
export const useSignalEffect = (effectCallback: () => void | Dispose) => {
  const effectRef = useRef(effectCallback);
  if (effectRef.current !== effectCallback) {
    effectRef.current = effectCallback;
  }

  return useEffect(() => effect(() => effectRef.current()), EMPTY);
};
