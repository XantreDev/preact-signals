import { Signal } from "@preact-signals/unified-signals";
import { CollectionTypes } from "./collectionHandlers";
import { RawSymbol, ShallowReactiveMarker, toDeepReactive } from "./reactivity";
import { Store } from ".";

type BaseTypes = string | number | boolean;

export type UnwrapSignal<T> = T extends Signal<infer V>
  ? V
  : T extends DeepSignal<infer V>
  ? UnwrapSignalSimple<V>
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
}

export const deepSignal = <T>(value: T) =>
  new DeepSignal(value as UnwrapSignal<T>);
