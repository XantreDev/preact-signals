import {
  ReadonlySignal,
  Signal,
  signal,
} from "@preact-signals/unified-signals";
import type { Call, Fn, Objects } from "hotscript";
import { useRef } from "react";
import { createTransformProps } from "react-fast-hoc";
import { Opaque, UnwrapOpaque } from "type-fest";
import { Uncached } from "../$";

export interface SignalifyProps extends Fn {
  return: this["arg1"] extends "children"
    ? this["arg0"]
    : this["arg0"] extends (...args: any[]) => any
    ? this["arg0"]
    : this["arg0"] extends Uncached<any> | ReadonlySignal<any>
    ? never | Uncached<this["arg0"]> | ReadonlySignal<this["arg0"]>
    : this["arg0"] | Uncached<this["arg0"]> | ReadonlySignal<this["arg0"]>;
}

class SignalifyHandler implements ProxyHandler<Record<string | symbol, any>> {
  #valuesCache = new Map<string | symbol, unknown>();

  get(target: Record<string | symbol, any>, p: string | symbol) {
    const value = target[p];
    if (!value) {
      return value;
    }
    if (value instanceof Uncached || value instanceof Signal) {
      return (
        this.#valuesCache.get(p) ??
        this.#valuesCache.set(p, value.value).get(p)!
      );
    }

    return value;
  }
}

export const signalifyProps = createTransformProps<
  [Objects.MapValues<SignalifyProps>]
>((props) => new Proxy(props, new SignalifyHandler()), {
  namePrefix: "Signalified.",
  mimicToNewComponent: false,
});

const reactifyLiteHandler: ProxyHandler<Record<string | symbol, any>> = {
  get(target: Record<string | symbol, any>, p: string | symbol) {
    const value = target[p];
    if (value instanceof Uncached || value instanceof Signal) {
      return value.value;
    }

    return value;
  },
};

export interface ReactifyPropsLite extends Fn {
  return: this["arg0"] extends ReactiveProps<Record<any, any>>
    ? Call<Objects.MapValues<SignalifyProps>, UnwrapOpaque<this["arg0"]>>
    : never;
}

export type ReactiveProps<T extends Record<any, any>> = Opaque<
  T,
  "reactify.reactive-props"
>;

export const reactifyPropsLite = createTransformProps<[ReactifyPropsLite]>(
  (props) => {
    if (process.env.NODE_ENV === "development") {
      for (const key in props) {
        const value = props[key];
        if (
          key !== "children" &&
          !(value instanceof Signal) &&
          !(value instanceof Uncached) &&
          typeof value !== "function"
        ) {
          console.warn(
            `reactifyPropsLite: ${key} is not a signal, it will not be reactive`
          );
        }
      }
    }

    return new Proxy(props, reactifyLiteHandler);
  }
);

declare const typeThrow: unique symbol;

type _ReactifyProps<T, TInitial extends Record<any, any>> = {
  [TKey in keyof TInitial as TKey extends string | number
    ? T extends Record<TKey, any>
      ? TKey
      : T extends Record<`${TKey}$`, () => any>
      ? `${TKey}$`
      : typeof typeThrow
    : typeof typeThrow]: TKey extends string | number
    ? T extends Record<`${TKey}$`, () => any>
      ? () => TInitial[TKey]
      : T extends Record<TKey, Uncached<any>>
      ? Uncached<TInitial[TKey]>
      : T extends Record<TKey, ReadonlySignal<any>>
      ? ReadonlySignal<TInitial[TKey]>
      : T extends Record<TKey, any>
      ? TInitial[TKey]
      : typeof typeThrow
    : typeof typeThrow;
};

export type ReactifyProps<
  T,
  TInitial extends Record<any, any>,
  TResult = _ReactifyProps<T, TInitial>
> = keyof TInitial extends `${string}$`
  ? {
      "reactify.reactive-props.error": "you cannot use a key that ends with $";
    }
  : TResult extends { [typeThrow]: any }
  ? never
  : TResult;

class MakeReactiveProps {
  #implicitSignals: Map<string, Signal<any>> = new Map();
  #props: Record<string, any>;
  constructor(props: Record<string, any>) {
    this.#props = props;
  }

  onRender(props: Record<string, any>) {
    if (this.#props === props) {
      return;
    }
    for (const key in this.#implicitSignals) {
      if (!(key in props)) {
        this.#implicitSignals.delete(key);
      }
    }
    this.#props = props;
  }

  createReactiveProps<
    TInitial extends Record<any, any>
  >(): ReactiveProps<TInitial> {
    const res = {} as ReactiveProps<TInitial>;
    const self = this;
    for (const key in this.#props) {
      const value = this.#props[key];
      const isEndsWith$ = key.endsWith("$");
      const keyWithout$ = isEndsWith$ ? key.slice(0, -1) : key;

      Object.defineProperty(res, keyWithout$, {
        get() {
          if (isEndsWith$) {
            return self.#props[key]();
          }
          if (
            value &&
            typeof value === "object" &&
            (value instanceof Signal || value instanceof Uncached)
          ) {
            return value.value;
          }
          if (typeof value === "function") {
            return value;
          }

          return (
            self.#implicitSignals.has(key)
              ? self.#implicitSignals.get(key)!
              : self.#implicitSignals
                  .set(key, signal(self.#props[key]))
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

/**
 * @description you can pass as prop: Uncached, ReadonlySignal or state.
 * But you should never change type of this prop
 * TODO: throw in dev mode
 */
export const reactifyProps = createTransformProps((props) => {
  const reactifyPropsRef = useRef<MakeReactiveProps | null>(null);
  if (!reactifyPropsRef.current) {
    reactifyPropsRef.current = new MakeReactiveProps(props);
  }
  reactifyPropsRef.current.onRender(props);

  return reactifyPropsRef.current.createReactiveProps();

  // const reactifyPropsHandlerRef = useRef<ReactifyPropsHandler | null>(null);
  // if (!reactifyPropsHandlerRef.current) {
  //   reactifyPropsHandlerRef.current = new ReactifyPropsHandler(props);
  // }
  // reactifyPropsHandlerRef.current.onRender(props);

  // return new Proxy(props, reactifyPropsHandlerRef.current);
});
