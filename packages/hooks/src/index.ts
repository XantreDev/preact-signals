import { AnyReactive, GetValue, unwrapReactive } from "@preact-signals/utils";
import {
  ReadonlySignal,
  Signal,
  computed,
  effect,
  signal,
} from "@preact/signals-core";
import { Context, useContext, useEffect, useRef } from "react";

/**
 *
 * @param compute applies only once - on first render, to make function on rerender have short live and be GC-ed with Minor GC. First function can be easily JIT-ed
 * @returns static reference computed
 */
export const useComputedOnce = <T>(compute: () => T) => {
  const c = useRef<null | ReadonlySignal<T>>(null);
  if (c.current === null) {
    c.current = computed(compute);
  }

  return c.current!;
};

const useSignal = <T>(value: T) => {
  const signalRef = useRef<null | Signal<T>>(null);
  if (!signalRef.current) {
    signalRef.current = signal(value);
  }

  return signalRef.current!;
};

const useComputed = <T>(compute: () => T) => {
  const computeRef = useRef(compute);
  computeRef.current = compute;

  return /**__INLINE__ */ useComputedOnce(() => computeRef.current());
};

export const useSignalOfReactive = <T extends AnyReactive>(
  reactive: T
): ReadonlySignal<GetValue<T>> =>
  useComputed(() => /** __PURE__ */ unwrapReactive(reactive));

export const useSignalOfState = <T>(state: T): ReadonlySignal<T> => {
  const s = useSignal(state);
  if (s.peek() !== state) {
    s.value = state;
  }

  return s;
};

export const useSignalContext = <T>(context: Context<T>) =>
  useSignalOfState(useContext(context));

type Dispose = () => void;
export const useSignalEffectOnce = (_effect: () => void | Dispose) => {
  useEffect(() => effect(_effect), []);
};
