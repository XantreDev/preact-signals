import "./store/sideEffects";

export {
  $,
  $w,
  signalOf$,
  ReactiveRef,
  Uncached,
  WritableReactiveRef,
  WritableUncached,
  type WritableRefOptions,
} from "./$";
export {
  createFlatStore,
  flatStore,
  flatStoreOfSignals,
  createFlatStoreOfSignals,
  type FlatStoreOfSignalsBody,
  type ReadonlySignalsKeys,
  type FlatStore,
  type ReadonlyFlatStore,
} from "./flat-store";
export {
  type CreateResourceReturn,
  type Errored,
  type InitializedResource,
  type Pending,
  type Ready,
  type Refreshing,
  type Resource,
  type ResourceActions,
  type ResourceFetcher,
  type ResourceFetcherInfo,
  type ResourceOptions,
  type ResourceSource,
  type ResourceState,
  type Unresolved,
  createResource,
  resource,
} from "./resource";
export {
  accessorOfReactive,
  accessorOfSignal,
  reaction,
  setterOfSignal,
  stableAccessorOfSignal,
  toggleSignal,
  untracked,
  unwrapReactive,
  rafReaction,
  isExplicitFalsy,
  writableRefOfArrayProp,
  writableRefOfObjectProp,
  toSolidLikeSignal,
  type ExplicitFalsy,
  type GetTruthyValue,
  type GetValue,
  type SolidSignalApi,
  type Accessor,
  type AnyReactive,
  type CreateFunction,
  type Reactive,
  type Setter,
  type ReactionOptions,
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
