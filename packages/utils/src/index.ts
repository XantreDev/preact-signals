import "./store/sideEffects";

export * from "./$";
export {
  createFlatStore,
  flatStore,
  type FlatStore,
  type ReadonlyFlatStore,
} from "./flat-store";
export * from "./resource";
export {
  accessorOfReactive,
  accessorOfSignal,
  reaction,
  setterOfSignal,
  stableAccessorOfSignal,
  toggleSignal,
  untracked,
  unwrapReactive,
  type Accessor,
  type AnyReactive,
  type CreateFunction,
  type Reactive,
  type Setter,
} from "./utils";

export {
  deepSignal,
  type DeepSignal,
  type UnwrapSignal,
  type UnwrapSignalSimple,
  type WrapDeepSignal,
} from "./store/deepSignal";
export * as Store from "./store/publicReactivity";
export { isSignal } from "./store/utils";

declare const signalSymbol: unique symbol;
// @ts-expect-error
declare module "@preact/signals-core" {
  interface Signal<T> {
    /** flag for easier identification */
    [signalSymbol]: true;
  }
}
