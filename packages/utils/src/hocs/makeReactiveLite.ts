import { Signal } from "@preact-signals/unified-signals";
import { Call, Fn, Objects } from "hotscript";
import { createTransformProps } from "react-fast-hoc";
import { Opaque, UnwrapOpaque } from "type-fest";
import { Uncached } from "../$";
import { ReactifyProps } from "./reactifyProps";

const makeReactiveHandler: ProxyHandler<Record<string | symbol, any>> = {
  get(target: Record<string | symbol, any>, p: string | symbol) {
    const value = target[p];
    if (value instanceof Uncached || value instanceof Signal) {
      return value.value;
    }

    return value;
  },
};

export interface CreateReactiveComponentLite extends Fn {
  return: this["arg0"] extends ReactiveProps<Record<any, any>>
    ? Call<Objects.MapValues<ReactifyProps>, UnwrapOpaque<this["arg0"]>>
    : never;
}

export type ReactiveProps<T extends Record<any, any>> = Opaque<
  T,
  "reactify.reactive-props"
>;

export const makeReactiveLite = createTransformProps<
  [CreateReactiveComponentLite]
>((props) => {
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

  return new Proxy(props, makeReactiveHandler);
});
