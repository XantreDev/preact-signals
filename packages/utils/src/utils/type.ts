import { ReadonlySignal } from "@preact/signals-react";
import { ExplicitFalsy } from "./explicitFalsy";

export interface Accessor<T> {
  (): T;
}
export type Reactive<T> = ReadonlySignal<T> | Accessor<T>;

export type AnyReactive = Reactive<any>;

export type GetTruthyValue<T, TFalsy = ExplicitFalsy> = T extends Accessor<
  infer U | TFalsy
>
  ? U
  : T extends ReadonlySignal<infer U | TFalsy>
  ? U
  : never;

export type GetValue<T> = T extends Accessor<infer U>
  ? U
  : T extends ReadonlySignal<infer U>
  ? U
  : never;

export interface Setter<T> {
  (value: (prev: T) => T): T;
  (value: Exclude<T, Function>): T;
  (value: Exclude<T, Function> | ((prev: T) => T)): T;
}
