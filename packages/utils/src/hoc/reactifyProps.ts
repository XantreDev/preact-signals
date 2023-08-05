import { ReadonlySignal, Signal } from "@preact-signals/unified-signals";
import { Fn, Objects } from "hotscript";
import { createTransformProps } from "react-fast-hoc";
import { Uncached } from "../$";

export interface ReactifyProps extends Fn {
  return: this["arg1"] extends "children"
    ? this["arg0"]
    : this["arg0"] extends (...args: any[]) => any
    ? this["arg0"]
    : this["arg0"] extends Uncached<any> | ReadonlySignal<any>
    ? never | Uncached<this["arg0"]> | ReadonlySignal<this["arg0"]>
    : this["arg0"] | Uncached<this["arg0"]> | ReadonlySignal<this["arg0"]>;
}

class ReactifyHandler implements ProxyHandler<Record<string | symbol, any>> {
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

export const reactifyProps = createTransformProps<
  [Objects.MapValues<ReactifyProps>]
>((props) => new Proxy(props, new ReactifyHandler()), {
  namePrefix: "Reactified.",
  mimicToNewComponent: false,
});
