import { ReadonlySignal, Signal } from "@preact/signals-core";
import { Call, Fn, Objects } from "hotscript";
import { createTransformProps } from "react-fast-hoc";
import { Opaque, UnwrapOpaque } from "type-fest";
import { Uncached } from "./$";

export interface SignalifyProps extends Fn {
  return: this["arg1"] extends "children"
    ? this["arg0"]
    : this["arg0"] extends Uncached<any> | ReadonlySignal<any>
    ? "unsupported_signal_value"
    : this["arg0"] extends (...args: any[]) => any
    ? this["arg0"]
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

// const useRerender = () => useReducer(reducer, 0)[1];
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
// const reducer = (v: number) => (v + 1) | 0;
// export const signalifyProps = createTransformProps<
//   [Objects.MapValues<SignalifyProps>]
// >(
//   (props) => {
//     const rerender = useRerender();
//     const statusRef = useRef(RENDERING);
//     statusRef.current |= RENDERING;
//     statusRef.current &= ~SHOULD_UPDATE;

//     const reactiveHelper = useMemo(() => {
//       const mapSig = signal(new Map<string, ReadonlySignal<unknown>>());
//       const $set = new Set<string>();
//       const trackingSignals = new Set<ReadonlySignal<unknown>>();

//       const onRender = (newProps: Record<string, any>) => {
//         const map = mapSig.peek();
//         let isChanged = false;
//         for (const key in newProps) {
//           const value = props[key];
//           if (key === "children") {
//             continue;
//           }
//           if (
//             !value ||
//             !(value instanceof Signal || value instanceof Uncached)
//           ) {
//             const v = map.get(key);
//             if (v) {
//               trackingSignals.delete(v);
//               map.delete(key);
//               $set.delete(key);
//               isChanged = true;
//             }
//             continue;
//           }
//           if (value instanceof Signal && !trackingSignals.has(value)) {
//             console.log("not tracked");
//             $set.delete(key);
//             trackingSignals.delete(map.get(key)!);
//             trackingSignals.add(value);
//             map.set(key, value);
//             isChanged = true;
//             continue;
//           }
//           if (value instanceof Signal || $set.has(key)) {
//             continue;
//           }

//           const valueSig = computedOf$(value);

//           map.set(key, valueSig);
//           trackingSignals.add(valueSig);
//           isChanged = true;
//         }

//         if (isChanged) {
//           mapSig.value = new Map(map);
//         }
//       };

//       return { onRender, mapSig };
//     }, []);
//     reactiveHelper.onRender(props);

//     useSignalEffect(() => {
//       const container = reactiveHelper.mapSig.value;

//       return effect(() => {
//         for (const [__, sig] of container) {
//           sig.value;
//         }

//         // skiping case when signal props is changed - it can happen when component rerenders
//         // in this case we don't need to rerender component again
//         return () => {
//           if (statusRef.current !== 0) {
//             return;
//           }
//           statusRef.current |= SHOULD_UPDATE;
//           rerender();
//         };
//       });
//     });

//     const signalsMap = reactiveHelper.mapSig.peek();
//     for (const [key, sig] of signalsMap) {
//       props[key] = sig.peek();
//     }

//     statusRef.current = 0;
//     return props;
//   },
//   {
//     mimicToNewComponent: false,
//     namePrefix: "Signalified.",
//   }
// );
