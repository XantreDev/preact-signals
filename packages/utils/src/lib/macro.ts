import type { ReadonlySignal } from "@preact/signals-core";
import type { ReactiveRef } from "./$";

export type $$Type = <T>(value: T) => ReactiveRef<T>;

declare const stateType: unique symbol;
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
export declare const $$: $$Type;

/**
 * @internal
 */
type WritableStateMacro = {
  [stateType]?: "writable";
};

/**
 * @internal
 */
type ReadonlyStateMacro = {
  [stateType]?: "readonly";
};

export type DerefMacro<T extends WritableStateMacro | ReadonlyStateMacro> =
  T extends infer X & ReadonlyStateMacro
    ? ReadonlySignal<X>
    : T extends infer X & WritableStateMacro
      ? // we shouldn't expose mutable type
        ReadonlySignal<X>
      : // ? DeepSignal<X>
        {
          _typeError: "Provided type is not macro reference";
        };

export type $StateMacroTypeWritable = <T>(value: T) => T & WritableStateMacro;
export type $StateMacroType = <T>(value: T) => T & ReadonlyStateMacro;

export type $Deref = <T extends WritableStateMacro | ReadonlyStateMacro>(
  value: T
) => DerefMacro<T>;

/**
 *
 * Macro function that allows to get a real signal under the hood of reactive binding. Returns ReadonlySignal for safety
 *
 * @example
 * ```tsx
 * import type { ReadonlySignal } from '@preact-signals/safe-react'
 * import { $state, $deref } from '@preact-signals/utils/macro'
 *
 * let a = $state(10)
 * const aSig: ReadonlySignal<10> = $deref(a)
 * ```
 */
export declare const $deref: $Deref;

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
export declare const $state: $StateMacroTypeWritable & {
  /**
   * Macro hook-function that allows you to create deep reactive binding inside of component. Compile time wrapper around `useDeepSignal`
   *
   * @example
   * ```tsx
   * import { $state } from "@preact-signals/utils/macro";
   *
   * const Counter = () => {
   *   let count = $state.useState(1)
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
  useState: $StateMacroTypeWritable;
};

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
export declare const $derived: $StateMacroType & {
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
  useState: $StateMacroType;
  /**
   * Macro hook-function that creates reactive binding that is linked to a state that passed as argument. Compile time wrapper around `useSignalOfState`
   *
   * @example
   * ```tsx
   * import { $derived } from "@preact-signals/utils/macro";
   *
   * const Counter = (props: {count: number; onIncrement(): void}) => {
   *  // only allowed with const
   *  const count = $derived.useLinked(props.count)
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
  useLinked: $StateMacroType;
};

export declare const $useDerived: $StateMacroType;

throw new Error(
  `To use macro, you need to use babel plugin. Check out the README for more info. https://github.com/XantreDev/preact-signals/tree/main/packages/utils#preact-signalsutilsmacro-macros-improving-ergonomics`
);
