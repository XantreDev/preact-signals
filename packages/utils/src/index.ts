export * from "./$";
export {
  createFlatStore,
  flatStore,
  type FlatStore,
  type ReadonlyFlatStore
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
  type Setter
} from "./utils";

declare const signalSymbol: unique symbol;
// @ts-expect-error
declare module "@preact/signals-core" {
  interface Signal<T> {
    /** flag for easier identification */
    [signalSymbol]: true;
  }
}
