export {
  computed,
  signal as shallowRef,
} from "@preact-signals/unified-signals";
import { effect as _effect } from "@preact-signals/unified-signals";

// Vue doesn't have cleanup callback. It's ok to cast from testing purposes perspective
export const effect = _effect as (callback: () => unknown) => () => void;

export {
  isSignal as isRef,
  deepSignal as ref,
  type DeepSignal as Ref,
} from "../../lib/store";
export {
  isProxy,
  isReactive,
  isReadonly,
  isShallow,
  markRaw,
  deepReactive as reactive,
  deepReadonly as readonly,
  shallowReactive,
  shallowReadonly,
  toRaw,
  toDeepReactive as toReactive,
  toDeepReadonly as toReadonly,
} from "../../lib/store/publicReactivity";
