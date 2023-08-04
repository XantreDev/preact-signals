import { ReadonlySignal, Signal } from "@preact-signals/unified-signals";
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
      : T extends Record<`${TKey}`, Uncached<any> | ReadonlySignal<any>>
      ? Uncached<TInitial[TKey]> | ReadonlySignal<TInitial[TKey]>
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

class ReactifyPropsHandler
  implements ProxyHandler<Record<string | symbol, any>>
{
  constructor(private uncached: Record<string | symbol, Uncached<any>>) {}

  get(target: Record<string | symbol, any>, p: string) {
    const p$ = p + "$";
    const value$ = target[p$];
    if (value$ && typeof value$ === "function") {
      this.uncached[p] = new Uncached(value$);
      return this.uncached[p]!.value;
    }

    const value = target[p];
    if (value instanceof Uncached || value instanceof Signal) {
      return value.value;
    }

    return value;
  }
}

export const reactifyProps = createTransformProps((props) => {
  const uncachedRef = useRef({});

  return new Proxy(props, new ReactifyPropsHandler(uncachedRef.current));
});
