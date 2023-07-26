import { ReadonlySignal, Signal } from "@preact/signals-core";
import type { Call, Fn, Objects } from "hotscript";
import { createTransformProps } from "react-fast-hoc";
import { Opaque, UnwrapOpaque } from "type-fest";
import { Uncached } from "./$";

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

class ReactifyHandler implements ProxyHandler<Record<string | symbol, any>> {
  get(target: Record<string | symbol, any>, p: string | symbol) {
    const value = target[p];
    if (!value) {
      return value;
    }
    if (value instanceof Uncached || value instanceof Signal) {
      return value.value;
    }

    return value;
  }
}

interface ReactifyProps extends Fn {
  return: this["arg0"] extends ReactiveProps<Record<any, any>>
    ? Call<Objects.MapValues<SignalifyProps>, UnwrapOpaque<this["arg0"]>>
    : never;
}

export type ReactiveProps<T extends Record<any, any>> = Opaque<
  T,
  "reactify.reactive-props"
>;

export const reactifyProps = createTransformProps<[ReactifyProps]>(
  (props) => new Proxy(props, new ReactifyHandler())
);
