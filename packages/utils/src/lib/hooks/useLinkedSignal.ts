import {
  ReadonlySignal,
  Signal,
  useSignal,
} from "@preact-signals/unified-signals";
import { useComputedOnce } from "./useComputedOnce";

export type UnwrapSignalDeep<T> =
  T extends ReadonlySignal<infer V> ? UnwrapSignalDeep<V> : T;

const unwrap = <T>(value: T): UnwrapSignalDeep<T> =>
  (value instanceof Signal
    ? unwrap(value.value)
    : value) as UnwrapSignalDeep<T>;

/**
 *
 * @example
 * ```tsx
 * // always linked to value passed to hook
 * const s1 = useLinkedSignal(Math.random() > 0.5 ? 1 : 0)
 * // 0 | 1
 * console.log(s1.peek())
 *
 * const s2 = useLinkedSignal(Math.random() > 0.5 ? signal(true): false)
 * // false | true
 * console.log(s2.peek())
 *
 * // deeply unwrapping
 * const s3 = useLinkedSignal(signal(signal(signal(false))))
 * // false
 * console.log(s3.peek())
 * ```
 * @param value value that will be unwrapped and linked to result
 * @returns
 */
export const useLinkedSignal = <T>(
  value: T,
): ReadonlySignal<UnwrapSignalDeep<T>> => {
  const sig = useSignal(value);

  if (sig.peek() !== value) {
    sig.value = value;
  }

  return useComputedOnce(() => unwrap(sig.value));
};
