import { WritableReactiveRef } from "../$";
import type { Signal } from "@preact-signals/unified-signals";

/**
 *
 * Allows to create writableRef to object property of Signal. Using of `deepSignal` is preferred, but this API can be handy if you avoiding to use deep reactivity tracking system.
 *
 * @example
 * ```tsx
 * const obj = signal({
 *  a: 1,
 *  b: 2
 * })
 *
 * const a = writableRefOfObjectProp(obj, 'a')
 * a.value = 2
 *
 * console.log(obj.value.a) // 2
 * ```
 *
 */
export const writableRefOfObjectProp = <
  T extends Record<any, any>,
  K extends keyof T,
>(
  obj: WritableReactiveRef<T> | Signal<T>,
  key: K
): WritableReactiveRef<T[K]> =>
  new WritableReactiveRef(
    () => obj.value[key],
    (value) =>
      (obj.value = {
        ...obj.value,
        [key]: value,
      })
  );

/**
 *
 * Allows to create writableRef to array element of Signal. Using of `deepSignal` is preferred, but this API can be handy if you avoiding to use deep reactivity tracking system.
 *
 * @example
 * ```tsx
 * const arr = signal([1, 2, 3])
 *
 * const second = writableRefOfArrayProp(arr, 1)
 * second.value = 4
 *
 * console.log(arr.value) // [1, 4, 3]
 * ```
 */
export const writableRefOfArrayProp = <
  T extends readonly any[],
  TIndex extends number,
>(
  array: WritableReactiveRef<T> | Signal<T>,
  index: TIndex
): WritableReactiveRef<T[TIndex]> =>
  new WritableReactiveRef(
    () => array.value[index],
    (value) => {
      // @ts-expect-error unions
      array.value = [
        ...array.value.slice(0, index),
        value,
        ...array.value.slice(index + 1),
      ];
    }
  );
