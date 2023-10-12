import { type ReadonlySignal, Signal } from "@preact-signals/unified-signals";
import type { Fn, Objects } from "hotscript";
import { createTransformProps } from "react-fast-hoc";
import type { Uncached } from "../$";

export interface WithSignalProp extends Fn {
  return: this["arg1"] extends "children"
    ? this["arg0"]
    : this["arg0"] extends (...args: any[]) => any
    ? this["arg0"]
    : this["arg0"] extends Uncached<any> | ReadonlySignal<any>
    ? never | Uncached<this["arg0"]> | ReadonlySignal<this["arg0"]>
    : this["arg0"] | Uncached<this["arg0"]> | ReadonlySignal<this["arg0"]>;
}

class WithSignalPropsHandler
  implements ProxyHandler<Record<string | symbol, any>>
{
  #valuesCache = new Map<string | symbol, unknown>();

  get(target: Record<string | symbol, any>, p: string | symbol) {
    const value = target[p];
    if (!value) {
      return value;
    }
    if (value instanceof Signal) {
      return (
        this.#valuesCache.get(p) ??
        this.#valuesCache.set(p, value.value).get(p)!
      );
    }

    return value;
  }
}

/**
 * Allows to pass props to third party components that are not aware of signals. This will subscribe to signals on demand.
 */
export const withSignalProps = createTransformProps<
  [Objects.MapValues<WithSignalProp>]
>((props) => new Proxy(props, new WithSignalPropsHandler()), {
  namePrefix: "WithSignalProps.",
  mimicToNewComponent: false,
});
