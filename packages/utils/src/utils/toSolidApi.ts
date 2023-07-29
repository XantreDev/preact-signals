import { Signal } from "@preact/signals-react";
import { accessorOfSignal } from "./getter";
import { setterOfSignal } from "./setter";
import { Accessor, Setter } from "./type";

const referenceCache = new WeakMap<Signal<any>, SolidSignalApi<any>>();

export type SolidSignalApi<T> = readonly [Accessor<T>, Setter<T>];

export const toSolidLikeSignal = <T>(s: Signal<T>): SolidSignalApi<T> => {
  {
    const fromCache = referenceCache.get(s);
    if (fromCache) {
      return fromCache;
    }
  }

  const result = [accessorOfSignal(s), setterOfSignal(s)] as const;
  referenceCache.set(s, result);

  return result;
};
