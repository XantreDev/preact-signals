import { ReadonlySignal } from "@preact/signals-react";
import { Accessor } from "./type";

function accessor(this: ReadonlySignal<unknown>) {
  return this.value;
}

export const accessorOfSignal = <T>(s: ReadonlySignal<T>): Accessor<T> =>
  accessor.bind(s) as Accessor<T>;

const accessorsCache = new WeakMap<ReadonlySignal<any>, Accessor<any>>();

export const stableAccessorOfSignal = <T>(s: ReadonlySignal<T>): Accessor<T> =>
  accessorsCache.get(s) || accessorsCache.set(s, accessorOfSignal(s)).get(s)!;
