import { ReadonlySignal } from "@preact/signals-react";

export type RenderResult = React.ReactNode;
export type Falsy = false | null | undefined | 0 | "";
export type If<T extends boolean, A, B> = T extends true ? A : B;

export interface Accessor<T> {
  (): T;
}
export type AccessorOrSignal<T> = ReadonlySignal<T> | Accessor<T>;

export type AnyAccessorOrSignal = AccessorOrSignal<any>;

export type GetTruthyValue<T> = T extends Accessor<infer U | Falsy>
  ? U
  : T extends ReadonlySignal<infer U | Falsy>
  ? U
  : never;

export type GetValue<T> = T extends Accessor<infer U>
  ? U
  : T extends ReadonlySignal<infer U>
  ? U
  : never;
