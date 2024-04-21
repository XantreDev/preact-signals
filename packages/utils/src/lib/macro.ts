import { type ReactiveRef } from "./$";

console.log(
  "To use macro, you need to use babel plugin. Check out the README for more info."
);

export type $$Type = <T>(value: T) => ReactiveRef<T>;

const createMacroError =
  (macroName: string): ((...args: any[]) => never) =>
  () => {
    throw new Error(
      `'${macroName}' function is only available at compile time`
    );
  };

/**
 * Macro function that is compile time shorthand for `$(() => value)`
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
export const $$: $$Type = createMacroError("$$");

export type $StateMacroType = <T>(value: T) => T;

/**
 * Macro hook-function that allows you to create global reactive binding. Compile time wrapper around `deepSignal`
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
export const $state: $StateMacroType = createMacroError("$state");

/**
 * Macro hook-function that allows you to create deep reactive binding inside of component. Compile time wrapper around `useDeepSignal`
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
export const $useState: $StateMacroType = createMacroError("$useState");

/**
 * Macro hook-function that creates reactive binding that is linked to a state that passed as argument. Compile time wrapper around `useSignalOfState`
 *
 * @example
 * ```tsx
 * import { $useLinkedState } from "@preact-signals/utils/macro";
 *
 * const Counter = (props: {count: number; onIncrement(): void}) => {
 *  // only allowed with const
 *  const count = $useLinkedState(props.count)
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
 * ```
 */
export const $useLinkedState: $StateMacroType =
  createMacroError("$useLinkedState");

/**
 * Macro function that creates a derived reactive binding. Compile time wrapper around `computed`
 * @example
 * ```ts
 * import { $derived, $state } from "@preact-signals/utils/macro";
 *
 * let a = $state(1)
 * let b = $state(2)
 *
 * const c = $derived(a + b)
 * const doubleC = $derived(c * 2)
 *
 * console.log(c) // 3
 * console.log(doubleC) // 6
 * a = 3
 * console.log(c) // 5
 * console.log(doubleC) // 10
 * ```
 */
export const $derived: $StateMacroType = createMacroError("$derived");

/**
 * Macro function that creates a derived reactive binding. Compile time wrapper around `computed`
 *
 * @example
 * ```ts
 * import { $useDerived, $useState } from "@preact-signals/utils/macro";
 *
 * const Component = () => {
 *  let counter = $useState(0)
 *  const doubledCounter = $useDerived(counter * 2)
 *  const increment = () => counter++
 *
 *  return (
 *   <div>
 *    <button onClick={onIncrement}>Increment</button>
 *    <p>Counter {count}</p>
 *    <p>Doubled Counter {doubledCounter}</p>
 *   </div>
 *  );
 * }
 * ```
 */
export const $useDerived: $StateMacroType = createMacroError("$useDerived");
