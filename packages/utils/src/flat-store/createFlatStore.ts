import {
  ReadonlySignal,
  Signal,
  computed,
  signal,
} from "@preact-signals/unified-signals";
import type { IfNever, Opaque, ReadonlyKeysOf, SetReadonly } from "type-fest";
import { AnyRecord } from "../hooks";
import { FlatStoreSetter, setterOfFlatStore } from "./setter";

const __storeState = Symbol("store-state");
const handler: ProxyHandler<any> = {
  get(target, key, self) {
    if (key === __storeState) {
      return target[key];
    }
    const storageState = target[__storeState];
    if (key in storageState) {
      return storageState[key]?.value;
    }
    const prop = Object.getOwnPropertyDescriptor(target, key);
    if (key === "double") {
      console.log("double", prop);
    }
    if (prop?.get) {
      storageState[key] = computed(prop.get?.bind(self));
      delete target[key];
      return storageState[key]?.value;
    }
    if (typeof target[key] === "function") {
      return target[key];
    }

    storageState[key] = signal(target[key]);
    delete target[key];
    return storageState[key].value;
  },
  set(target, key, value) {
    if (typeof target[key] === "function") {
      target[key] = value;
      return true;
    }
    const storageState = target[__storeState];
    if (key in target) {
      delete target[key];
    }
    if (!storageState[key]) {
      storageState[key] = signal(value);
      return true;
    }

    storageState[key].value = value;
    return true;
  },
  deleteProperty(target, key) {
    const storage =
      key in target
        ? target
        : key in target[__storeState]
        ? target[__storeState]
        : null;
    if (!storage) {
      return false;
    }
    delete storage[key];
    return true;
  },
  has(target, key) {
    return key in target || key in target[__storeState];
  },
  ownKeys(target) {
    return [...Object.keys(target), ...Object.keys(target[__storeState])];
  },
  getOwnPropertyDescriptor() {
    return {
      enumerable: true,
      configurable: true,
    };
  },
};

export type FlatStore<T extends Record<any, any>> = Opaque<
  T,
  "@preact-signals/utils;flatStore"
>;

export type ReadonlyFlatStore<T extends Record<any, any>> = Readonly<
  FlatStore<T>
>;

/**
 *
 * @param initialState this value will be **mutated** and proxied
 * @returns
 */
export const flatStore = <T extends Record<any, any>>(
  initialState: T
): FlatStore<T> => {
  // @ts-expect-error
  if (initialState[__storeState]) {
    return initialState as FlatStore<T>;
  }

  // @ts-expect-error
  initialState[__storeState] = {} as Record<string, Signal<any>>;

  return new Proxy(initialState, handler);
};

type FlatStoreOfSignals = <T extends Record<any, any>>(
  initialState: T
) => FlatStore<FlatStoreOfSignalsBody<T>>;

export type FlatStoreOfSignalsBody<T extends Record<any, any>> = SetReadonly<
  {
    [TKey in keyof T]: T[TKey] extends ReadonlySignal<infer TValue>
      ? TValue
      : T[TKey];
  },
  ReadonlySignalsKeys<T>
>;
export type ReadonlySignalsKeys<T extends AnyRecord> = keyof {
  [TKey in keyof T as IfNever<
    ReadonlyKeysOf<T[TKey]>,
    never,
    T[TKey] extends ReadonlySignal<unknown> ? TKey : never
  >]: T[TKey];
};

/**
 *
 * @param initialState this value will be **mutated** and proxied
 * @returns
 */
export const flatStoreOfSignals: FlatStoreOfSignals = <
  T extends Record<any, any>
>(
  initialState: T
): FlatStore<FlatStoreOfSignalsBody<T>> => {
  const signalValues = {} as Record<string, Signal<any>>;
  for (const key in initialState) {
    const valueDescriptor = Object.getOwnPropertyDescriptor(initialState, key);
    if (valueDescriptor?.get) {
      continue;
    }
    const value = initialState[key];

    // @ts-expect-error fuck you typescript, i wanna write OCaml
    if (value && typeof value === "object" && value instanceof Signal) {
      signalValues[key] = initialState[key];
      delete initialState[key];
      continue;
    }
  }

  const self = new Proxy(
    Object.assign(initialState, { [__storeState]: signalValues }),
    handler
  ) as FlatStore<FlatStoreOfSignalsBody<T>>;

  return self;
};

export const createFlatStore = <T extends Record<any, any>>(
  initialState: T
) => {
  const store = flatStore(initialState);

  return [store, setterOfFlatStore(store)] as const;
};

export const createFlatStoreOfSignals = <T extends Record<any, any>>(
  initialState: T
): readonly [
  FlatStore<FlatStoreOfSignalsBody<T>>,
  FlatStoreSetter<FlatStoreOfSignalsBody<T>>
] => {
  const store = flatStoreOfSignals(initialState);

  return [store, setterOfFlatStore(store)];
};
