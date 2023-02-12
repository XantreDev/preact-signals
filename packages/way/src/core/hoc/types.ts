import type { Signal } from "@preact/signals-react";
import { Simplify } from "type-fest";

export type ExecutorSpecificProps = {
  uniqueRenderObject: object;
};

export type HookExecutorProps<T = unknown> = {
  props?: T;
} & ExecutorSpecificProps;

export type AnyRecord = Record<any, any>;

export type Signalify<T> = Simplify<T extends Signal<any> ? T : Signal<T>>;
export type SignalifyObject<T> = T extends Record<string, any>
  ? { [Key in keyof T]: Signalify<T[Key]> }
  : T;
