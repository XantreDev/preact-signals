import {
  ReadonlySignal,
  Signal,
  effect,
  signal,
  useComputed,
  useSignal,
} from "@preact-signals/unified-signals";
import { Context, useContext, useEffect, useRef } from "react";
import {
  AnyReactive,
  GetValue,
  ReducerSignal,
  reducerSignal,
  untracked,
  unwrapReactive,
} from "../utils";
import { EMPTY_ARRAY } from "../constants";

/**
 * Allows to create signal function which is called only once, without dependencies tracking
 */
export const useInitSignal = <T>(init: () => T) => {
  const signalRef = useRef<null | Signal<T>>(null);
  if (signalRef.current === null) {
    signalRef.current = signal(untracked(init));
  }

  return signalRef.current!;
};

/**
 * Creates computed which will subscribe tp reactive value
 */
export const useSignalOfReactive = <T extends AnyReactive>(
  reactive: T
): ReadonlySignal<GetValue<T>> =>
  useComputed(() => /** __PURE__ */ unwrapReactive(reactive));

/**
 *
 * Creates signal which state is always equal to state passed to hook
 */
export const useSignalOfState = <T>(state: T): ReadonlySignal<T> => {
  const s = useSignal(state);
  if (s.peek() !== state) {
    s.value = state;
  }

  return s;
};

/**
 *
 * @param context
 * @returns signal of context value
 */
export const useSignalContext = <T>(context: Context<T>) =>
  useSignalOfState(useContext(context));

export type Dispose = () => void;
/**
 *
 * Creates effect with with first provided function
 */
export const useSignalEffectOnce = (_effect: () => void | Dispose) => {
  useEffect(() => effect(_effect), EMPTY_ARRAY);
};

/**
 *
 * Hook wrapper for {@link reducerSignal}
 */
export const useReducerSignal: typeof reducerSignal = (
  initialValue,
  reducer
) => {
  const ref = useRef<null | ReducerSignal<any, any>>(null);

  if (ref.current === null) {
    ref.current = reducerSignal(initialValue, reducer);
  }

  return ref.current;
};
