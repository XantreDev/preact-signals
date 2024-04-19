import { untracked } from "@preact-signals/utils";
import { UseOnlyReactiveUpdatesProp } from "./types";
import {
  useComputed,
  useSignal,
  useSignalEffect,
} from "@preact-signals/unified-signals";
import { useCallback, useRef } from "react";

export const EMPTY_OBJECT = {} as const;
export const EMPTY_ARRAY = [] as const;

const wrapHandler: ProxyHandler<Function> = {
  apply(target, thisArg, args) {
    return untracked(() => target.apply(thisArg, args));
  },
};

export const wrapWithUntracked = /** __PURE__ */ <T extends Function>(
  fn: T
): T => new Proxy(fn, wrapHandler) as T;

export const wrapFunctionsInUntracked = /** __PURE__ */ <
  T extends Record<any, any>,
>(
  obj: T
): T => {
  for (const key in obj) {
    if (typeof obj[key] === "function") {
      obj[key] = wrapWithUntracked(obj[key]);
    }
  }
  return obj;
};

export const useRefBasedOptions = <T extends UseOnlyReactiveUpdatesProp>(
  options: () => T
) => {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const stableCallback = useCallback(() => optionsRef.current(), EMPTY_ARRAY);

  const useOnlyReactiveUpdatesRef = useRef(false);
  const sig = useSignal(stableCallback);
  if (useOnlyReactiveUpdatesRef.current) {
    sig.value = stableCallback;
  } else {
    sig.value = options;
  }

  const computed = useComputed(() => sig.value());
  useSignalEffect(() => {
    useOnlyReactiveUpdatesRef.current =
      computed.value.useOnlyReactiveUpdates ?? false;
  });

  return computed;
};
