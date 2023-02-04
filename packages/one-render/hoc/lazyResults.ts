import { Signal, signal } from "@preact/signals-react";
import { createObject, isSignal } from "../utils";
import { AnyRecord } from "./types";

const COMPLEX_HOOK_RESULTS = new WeakSet<object>();

// Only type thing
export type BrandString = "__complex";
export type Brand = Record<BrandString, true>;

export const complex = <T extends AnyRecord>(data: T) => (
  COMPLEX_HOOK_RESULTS.add(data), data as T & Brand
);

type LazyPropNode = {
  change: (item: any) => void;
  signal: Signal<any>;
};

export type LazyNode = {
  update(newValue: any): void;
  result: Signal | Record<any, Signal>;
};

const isComplex = (item: unknown): item is Brand =>
  typeof item === "object" && !!item && COMPLEX_HOOK_RESULTS.has(item);

export const lazyNode = <T>(_results: T): LazyNode => {
  const results = _results as any;

  if (typeof results !== "object" || results === null || !isComplex(results)) {
    const resultsSignal = signal(results);

    return {
      update: (newValue: T) => {
        resultsSignal.value = newValue;
      },
      result: resultsSignal,
    };
  }

  const object = Object.freeze(createObject<Record<any, any>>());

  const lazyMap: Partial<Record<any, LazyPropNode>> = {};

  const handler: ProxyHandler<typeof object> = {
    get(__, propName: any) {
      {
        const node = lazyMap[propName];
        if (node) {
          return node.signal;
        }
      }

      const node = createObject<LazyPropNode>();

      const resultValue = (results as any)[propName];

      const s = isSignal(resultValue) ? resultValue : signal(resultValue);
      delete (results as any)[propName];
      const change = (newValue: any) => {
        s.value = newValue;
      };

      node.change = change;
      node.signal = s;

      return node.signal;
    },
  };

  const update = (newComplex: AnyRecord) => {
    for (const key in newComplex) {
      const value = newComplex[key];
      const node = lazyMap[key];
      if (!node) {
        (results as any)[key] = value;
        continue;
      }

      if (node.signal.peek() === value) {
        continue;
      }
      node.change(value);
    }
    for (const key in lazyMap) {
      const value = lazyMap[key];
      if (key in newComplex) {
        continue;
      }
      value?.change(undefined);
    }
  };

  return { result: new Proxy(object, handler), update };
};
