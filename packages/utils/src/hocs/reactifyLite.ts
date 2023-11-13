import { Signal, signal } from "@preact-signals/unified-signals";
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

class ReactifyPropsLiteHandler {
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

      Object.defineProperty(res, key, {
        get() {
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
    const hander = useRef<null | ReactifyPropsLiteHandler>(null);

    if (hander.current === null) {
      hander.current = new ReactifyPropsLiteHandler(props);
    }
    hander.current.onRender(props);

    return hander.current.createReactiveProps();
  },
  {
    displayNameTransform: {
      type: "prefix",
      value: "ReactifyLite.",
    },
  }
);
