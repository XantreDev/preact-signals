import type { Signal } from "@preact/signals-react";
import type * as React from "react";

type PickHooks<T extends Record<string, unknown>> = {
  [Key in keyof T as Key extends `use${string}` ? Key : never]: T[Key];
};

export type HookName = keyof PickHooks<typeof React>;

export type ExecutorSpecificProps = {
  uniqueRenderObject: object;
};

export type HookExecutorProps<T = unknown> = {
  props?: T;
} & ExecutorSpecificProps;

export type AnyRecord = Record<any, any>;

export type Signalify<T> = T extends Signal<any> ? T : Signal<T>;
export type SignalifyObject<T> = T extends Record<string, any>
  ? { [Key in keyof T]: Signalify<T[Key]> }
  : T;
