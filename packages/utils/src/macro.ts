import { ReactiveRef } from "./lib";

console.log(
  "To use macro, you need to use babel plugin. Check out the README for more info."
);
/**
 * This macro function is compile time shorthand for `$(() => value)`
 *
 * @example
 * ```tsx
 * import { $$ } from "@preact-signals/utils/macro";
 *
 * // This is equivalent to:
 * // const a = $(() => 1)
 * const a = $$(1)
 * ```
 *
 * @example A more complex example
 * ```tsx
 * import { $$ } from "@preact-signals/utils/macro";
 *
 * const a = signal(1)
 * const sig = signal(1)
 * const b = $$(a.value + sig.value)
 *
 * effect(() => {
 *   console.log(b.value)
 * })
 *
 * // logs 3
 * sig.value = 2
 *
 * // logs 4
 * a.value = 2
 * ```
 */
export const $$: <T>(value: T) => ReactiveRef<T> = () => {
  throw new Error("'$$' function is only available at compile time");
};

/**
 * This macro function is marks a value in VariableDeclarator  as deep reactive state.
 *
 * @example
 * ```tsx
 * import { $state } from "@preact-signals/utils/macro";
 *
 * let a = $state(1)
 *
 * effect(() => {
 *  console.log(a)
 * })
 *
 * // logs 1
 * a = 2
 * ```
 *
 */
export const $state: <T>(value: T) => T = () => {
  throw new Error("'$state' function is only available at compile time");
};

/**
 * This macro hook-function is marks a value in VariableDeclarator as deep reactive state.
 *
 * @example
 * ```tsx
 * import { $useState } from "@preact-signals/utils/macro";
 *
 * const Counter = () => {
 *   let count = $useState(1)
 *
 *   return (
 *    <div>
 *     <button onClick={() => count++}>Increment</button>
 *     <p>{count}</p>
 *   </div>
 *  )
 * }
 * ```
 *
 */
export const $useState: <T>(value: T) => T = () => {
  throw new Error("'$useState' function is only available at compile time");
};

/**
 * This macro hook-function is marks a value in VariableDeclarator as reactive value that is linked to a state from component render state.
 *
 * @example
 * ```tsx
 * import { $useLinkedState } from "@preact-signals/utils/macro";
 *
 * const Counter = (props: {count: number; onIncrement(): void}) => {
 *  let count = $useLinkedState(props.count)
 *  // allows to use value in effect
 *  useSignalEffect(() => {
 *   console.log(count)
 *  })
 *
 *  return (
 *   <div>
 *    <button onClick={props.onIncrement}>Increment</button>
 *    <p>{props.count}</p>
 *   </div>
 *  )
 * }
 */
export const $useLinkedState: <T>(value: T) => T = () => {
  throw new Error(
    "'$useLinkedState' function is only available at compile time"
  );
};
