import {
  type ReadonlySignal,
  Signal,
  signal,
} from "@preact-signals/unified-signals";
import { useRef } from "react";
import { createTransformProps } from "react-fast-hoc";
import type { Uncached } from "../$";
import type { Accessor } from "../utils";
import { IGNORED_PROPS } from "./constants";
import type { ReactiveProps } from "./reactifyLite";

declare const typeThrow: unique symbol;

type ReactifyPropsInitial<T extends Record<any, any>> = {
  [TKey in keyof T as TKey extends string | number
    ? TKey
    : TKey]?: T[TKey] extends Uncached<any> | ReadonlySignal<any>
    ? Uncached<T[TKey]> | ReadonlySignal<T[TKey]>
    : T[TKey];
} & {
  [TKey in keyof T as TKey extends string | number
    ? `${TKey}$`
    : TKey]?: Accessor<T[TKey]>;
};

type Error<Reason> = {
  [typeThrow]: Reason;
};

type TypecheckProps<
  T extends Record<any, any>,
  TInitial extends Record<any, any>
> = {
  [TKey in keyof TInitial]: TKey extends string | number
    ? TKey extends keyof T
      ? `${TKey}$` extends keyof T
        ? Error<`You can define only key with $ postfix and key without postfix, but not both: "${TKey}"`>
        : T[TKey] extends Uncached<any>
        ? never
        : T[TKey] extends ReadonlySignal<any>
        ? never
        : T[TKey] extends TInitial[TKey]
        ? never
        : Error<`Type of "${TKey}" is not assignable to type property type`>
      : `${TKey}$` extends keyof T
      ? T[TKey] extends Accessor<any>
        ? never
        : Error<`You can define only key with $ postfix and key without postfix, but not both: "${TKey}"`>
      : never
    : never;
}[keyof TInitial];

export type ReactifyComponentReturn<
  T extends Record<any, any>,
  TInitial extends Record<any, any>,
  TTypecheck extends TypecheckProps<T, TInitial> = TypecheckProps<T, TInitial>
> = keyof TInitial extends `${string}$`
  ? {
      "reactify.reactive-props.error": "you cannot use a key that ends with $";
    }
  : (args: ReactifyPropsInitial<T>) => TTypecheck extends never
      ? JSX.Element
      : {
          "reactify.reactive-props.error": TTypecheck[typeof typeThrow];
        };

class ReactifyPropsHandler {
  _implicitSignals: Map<string, Signal<any>> = new Map();
  _props: Record<string, any>;
  constructor(props: Record<string, any>) {
    this._props = props;
  }

  onRender(props: Record<string, any>) {
    if (this._props === props) {
      return;
    }
    for (const [key, value] of this._implicitSignals) {
      if (!(key in props)) {
        value.value = undefined;
      }
    }
    // for (const key in this.#implicitSignals) {
    //   if (!(key in props)) {
    //     this.#implicitSignals.delete(key);
    //   }
    // }
    this._props = props;
  }

  createReactiveProps<
    TInitial extends Record<any, any>
  >(): ReactiveProps<TInitial> {
    const res = {} as ReactiveProps<TInitial>;
    const self = this;
    for (const key in this._props) {
      const value = this._props[key];
      if (IGNORED_PROPS.includes(key)) {
        // @ts-expect-error
        res.ref = value;
        continue;
      }
      const isEndsWith$ = key.endsWith("$");
      const keyWithout$ = isEndsWith$ ? key.slice(0, -1) : key;

      Object.defineProperty(res, keyWithout$, {
        get() {
          if (isEndsWith$) {
            return self._props[key]();
          }
          if (value && typeof value === "object" && value instanceof Signal) {
            return value.value;
          }
          if (typeof value === "function") {
            return value;
          }

          return (
            self._implicitSignals.has(key)
              ? self._implicitSignals.get(key)!
              : self._implicitSignals
                  .set(key, signal(self._props[key]))
                  .get(key)!
          ).value;
        },
        enumerable: true,
      });
    }

    return res;
  }
}

// class ReactifyPropsHandler
//   implements ProxyHandler<Record<string | symbol, any>>
// {
//   #implicitSignals: Map<string, Signal<any>> = new Map();
//   #uncached: Map<string, Uncached<any>> = new Map();
//   #props: Record<string, any>;
//   constructor(props: Record<string, any>) {
//     this.#props = props;
//   }

//   get(target: Record<string | symbol, any>, p: string) {
//     if (typeof p !== "string") {
//       // @ts-expect-error
//       return Reflect.get(...arguments);
//     }
//     const p$ = p + "$";
//     {
//       const fromCache = this.#uncached.get(p$);
//       if (fromCache) {
//         return fromCache;
//       }
//     }
//     {
//       const value$ = this.#props[p$];
//       if (value$ && typeof value$ !== "function") {
//         throw new Error(`reactifyProps: ${p$} is not a function`);
//       }
//       if (value$ && typeof value$ === "function") {
//         const $value = $(value$);
//         console.log($value);
//         this.#uncached.set(p$, $value);
//         return $value.value;
//       }
//     }

//     const value = this.#props[p];
//     if (value instanceof Uncached || value instanceof Signal) {
//       return value.value;
//     }

//     return value;
//   }
//   ownKeys(target: Record<string | symbol, any>): ArrayLike<string | symbol> {
//     const arr = new Array<string | symbol>();
//     for (const key in this.#props) {
//       arr.push(key.endsWith("$") ? key.slice(0, -1) : key);
//     }
//     return arr;
//   }
//   has(target: Record<string | symbol, any>, p: string | symbol): boolean {
//     if (typeof p !== "string") {
//       // @ts-expect-error
//       return Reflect.has(...arguments);
//     }

//     return p in target || `${p}$` in target;
//   }
//   preventExtensions(target: Record<string | symbol, any>): boolean {
//     return true;
//   }

//   onRender(props: Record<string, any>) {
//     if (this.#props === props) {
//       return;
//     }
//     for (const key in this.#uncached) {
//       if (!(key in props)) {
//         this.#uncached.delete(key);
//       }
//     }
//     for (const key in this.#implicitSignals) {
//       if (!(key in props)) {
//         this.#implicitSignals.delete(key);
//       }
//     }
//     this.#props = props;
//   }
//   getOwnPropertyDescriptor() {
//     return {
//       enumerable: true,
//       configurable: true,
//     };
//   }
// }
// this is not ready yet

/**
 * @description you can pass as prop: Uncached, ReadonlySignal or state.
 * But you should never change type of this prop
 * TODO: throw in dev mode
 */
export const reactify = createTransformProps((props) => {
  const reactifyPropsRef = useRef<ReactifyPropsHandler | null>(null);
  if (!reactifyPropsRef.current) {
    reactifyPropsRef.current = new ReactifyPropsHandler(props);
  }
  reactifyPropsRef.current.onRender(props);

  return reactifyPropsRef.current.createReactiveProps();

  // const reactifyPropsHandlerRef = useRef<ReactifyPropsHandler | null>(null);
  // if (!reactifyPropsHandlerRef.current) {
  //   reactifyPropsHandlerRef.current = new ReactifyPropsHandler(props);
  // }
  // reactifyPropsHandlerRef.current.onRender(props);

  // return new Proxy(props, reactifyPropsHandlerRef.current);
  // TODO: implement types
}) as <T extends React.ComponentType<any>, TProps>(
  component: T
) => React.ComponentType<any>;
