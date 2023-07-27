import {
  AnyReactive,
  GetValue,
  toSolidLikeSignal,
  untrackedPolyfill,
  unwrapReactive,
} from "@preact-signals/internal-utils";
import { ReadonlySignal, Signal, effect, signal, useComputed, useSignal } from "@preact/signals-react";
import { Context, useContext, useEffect, useRef } from "react";

export { useComputedOnce } from "./useComputedOnce";

export const useInitSignal = <T>(init: () => T) => {
  const signalRef = useRef<null | Signal<T>>(null);
  if (!signalRef.current) {
    signalRef.current = signal(untrackedPolyfill(init));
  }

  return signalRef.current!;
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

export type Dispose = () => void;
export const useSignalEffectOnce = (_effect: () => void | Dispose) => {
  useEffect(() => effect(_effect), []);
};

export const useSignalState = <T>(value: T) =>
  toSolidLikeSignal(useSignal(value));
