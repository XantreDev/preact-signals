import { Signal, signal, untracked } from "@preact-signals/unified-signals";
import type { Call, Fn, Objects } from "hotscript";
import { useRef } from "react";
import { createTransformProps } from "react-fast-hoc";
import type { Opaque, UnwrapOpaque } from "type-fest";
import { IGNORED_PROPS } from "./constants";
import type { WithSignalProp } from "./withSignalProps";

// const reactifyLiteHandler: ProxyHandler<Record<string | symbol, any>> = {
//   get(target: Record<string | symbol, any>, p: string | symbol) {
//     const value = target[p];
//     if (value instanceof Uncached || value instanceof Signal) {
//       return value.value;
//     }

//     return value;
//   },
// };

export interface ReactifyLiteFn extends Fn {
  return: this["arg0"] extends ReactiveProps<Record<any, any>>
    ? Call<Objects.MapValues<WithSignalProp>, UnwrapOpaque<this["arg0"]>>
    : never;
}

export type ReactiveProps<T extends Record<any, any>> = Opaque<
  T,
  "reactify.reactive-props"
>;

class PropsCreatorHandler implements ProxyHandler<Record<string, any>> {
  _implicitSignals: null | Map<string, Signal> = null;
  public proxy: Record<string | symbol, any>;
  // have to store props to allow it to provide comparsion of props
  constructor(private _props: Record<string | symbol, any>) {
    this.proxy = new Proxy({}, this);
  }
  updateProps(props: Record<string | symbol, any>) {
    this._props = props;
    for (const key in this._implicitSignals) {
      if (Object.hasOwn(props, key)) {
        this._implicitSignals.get(key)!.value = props[key];
      } else {
        this._implicitSignals.get(key)!.value = undefined;
      }
    }
  }

  get(_: Record<string | symbol, any>, p: string, receiver: any) {
    if (Object.hasOwn(this._props, p)) {
      const value = this._props[p];
      if (IGNORED_PROPS.includes(p)) {
        return value;
      }
      if (typeof value === "function") {
        return value;
      }
      if (value instanceof Signal) {
        return value.value;
      }
      if (this._implicitSignals === null) {
        this._implicitSignals = new Map();
      }
      if (!this._implicitSignals.has(p)) {
        this._implicitSignals.set(p, signal(value));
      }
      return value;
    }

    return Reflect.get(this._props, p, receiver);
  }
  ownKeys(target: Record<string, any>): ArrayLike<string | symbol> {
    return Reflect.ownKeys(this._props);
  }
  has(target: Record<string, any>, p: string | symbol): boolean {
    return Reflect.has(this._props, p);
  }
  set(): never {
    throw new Error("cannot write reactive props");
  }
  getOwnPropertyDescriptor(target: Record<string, any>, p: string | symbol) {
    return Reflect.getOwnPropertyDescriptor(this._props, p);
  }
  defineProperty(): boolean {
    return false;
  }
  deleteProperty(): never {
    throw new Error("cannot delete reactive props");
  }
}

/**
 * ### Allows to provide Signal/Uncached values as props.
 * under the hood each prop will be converted to reactive primitive, and after it props getters will be passed to the component.
 * Limitations:
 * * you should not destruct props in the component, because it will create extra re-renders
 * * you should not change references of reactive props
 * * functions passed as props are not reactive, so you should memoize them before passing. (in most cases it is not a problem)
 * Because of this limitations you should mark props as `ReactiveProps` to be sure that you aware of this.
 * @example
 * ```tsx
 * const Component = reactifyLite((props: ReactiveProps<{
 *   foo: string;
 *   bar: number;
 * }>) => {
 *   return <Show when={() => props.bar > 10}>{() => props.foo}</Show>;
 * });
 *
 * const App = () => {
 *  const bar = useSignal(0);
 *  useEffect(() => {
 *   setTimeout(() => {
 *    bar.value = 20;
 *   }, 1000);
 *  }, []);
 *
 *  return <Component foo="foo" bar={bar} />;
 * }
 * ```
 *
 */
export const reactifyLite = createTransformProps<[ReactifyLiteFn]>(
  (props) => {
    const reactivePropsRef = useRef<null | PropsCreatorHandler>(null);

    if (reactivePropsRef.current === null) {
      reactivePropsRef.current = new PropsCreatorHandler(props);
    } else {
      reactivePropsRef.current.updateProps(props);
    }

    return reactivePropsRef.current.proxy;
  },
  {
    displayNameTransform: {
      type: "prefix",
      value: "ReactifyLite.",
    },
  }
);
