import { Signal } from "@preact-signals/unified-signals";
import { CollectionTypes } from "./collectionHandlers";
import {
  type RawSymbol,
  type ShallowReactiveMarker,
  toDeepReactive,
} from "./reactivity";
import { isSignal } from "./utils";

type BaseTypes = string | number | boolean;

export type UnwrapSignal<T> = T extends DeepSignal<infer V>
  ? UnwrapSignalSimple<V>
  : T extends Signal<infer V>
    ? V
    : UnwrapSignalSimple<T>;

export type UnwrapSignalSimple<T> = T extends
  | Function
  | CollectionTypes
  | BaseTypes
  | Signal
  // | RefUnwrapBailTypes[keyof RefUnwrapBailTypes]
  | { [RawSymbol]?: true }
  ? T
  : T extends ReadonlyArray<any>
    ? { [K in keyof T]: UnwrapSignalSimple<T[K]> }
    : T extends object & { [ShallowReactiveMarker]?: never }
      ? {
          [P in keyof T]: P extends symbol ? T[P] : UnwrapSignal<T[P]>;
        }
      : T;

export class DeepSignal<T> extends Signal<T> {
  constructor(value: T) {
    super(toDeepReactive(value));
  }
  set value(value: T) {
    super.value = toDeepReactive(value);
  }
  get value() {
    return super.value;
  }

  declare __not_exist_deepSignal: true;
}

export type WrapDeepSignal<T> = T extends Signal<any>
  ? T
  : DeepSignal<UnwrapSignal<T>>;

/**
 *
 * Takes an inner value and returns a reactive and mutable signal, with deepReactive inside of it.
 *
 * @param value - The object to wrap in the deepSignal.
 */
export const deepSignal = /** #__PURE__ */ <T>(value: T): WrapDeepSignal<T> => {
  if (isSignal(value)) {
    return value as WrapDeepSignal<T>;
  }

  return new DeepSignal(value) as WrapDeepSignal<T>;
};
