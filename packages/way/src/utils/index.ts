import { Unsignalify } from "@/core/hoc/types";
import { Signal } from "@preact/signals-react";

type AnyRecord = Record<any, any>;

export const createObject = <T extends AnyRecord>() => Object.create(null) as T;
export const unsignalify = <T>(value: T) => {
  while (value instanceof Signal) {
    value = value.peek();
  }
  return value as Unsignalify<T>;
};
