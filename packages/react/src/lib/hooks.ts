"use client";

import { signal, computed, effect } from "@preact/signals-core";
import { useRef, useMemo, useEffect } from "react";

const Empty = [] as const;
export function useSignal<T>(value: T) {
  return useMemo(() => signal<T>(value), Empty);
}

export function useComputed<T>(compute: () => T) {
  const $compute = useRef(compute);
  $compute.current = compute;
  return useMemo(() => computed<T>(() => $compute.current()), Empty);
}

export function useSignalEffect(cb: () => void | (() => void)) {
  const callback = useRef(cb);
  callback.current = cb;

  useEffect(() => {
    return effect(() => callback.current());
  }, Empty);
}
