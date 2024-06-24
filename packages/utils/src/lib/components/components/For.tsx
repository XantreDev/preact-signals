import {
  Fragment,
  ReactNode,
  cloneElement,
  createElement,
  isValidElement,
  useRef,
} from "react";
import {
  useComputedOnce,
  useSignalOfReactive,
  useSignalOfState,
} from "../../hooks";
import type { GetValue, Reactive } from "../../utils";
import { RenderResult } from "../type";
import {
  ReadonlySignal,
  Signal,
  untracked,
} from "@preact-signals/unified-signals";

type GetArrItemValue<T extends Reactive<any[]>> = GetValue<T>[number];

export type KeyExtractor<T> = (item: T, index: number) => React.Key;
export type ForProps<T extends Reactive<any[]>> = {
  each: T;
  fallback?: RenderResult;
  children: (accessor: GetArrItemValue<T>, index: number) => RenderResult;
} & (GetArrItemValue<T> extends React.Key
  ? { keyExtractor?: KeyExtractor<GetArrItemValue<T>> }
  : { keyExtractor: KeyExtractor<GetArrItemValue<T>> });

/**
 * @useSignals
 */
export const For = <T extends Reactive<any[]>>({
  children,
  each,
  fallback,
  keyExtractor,
}: ForProps<T>): JSX.Element => {
  const eachComputed = useSignalOfReactive(each);
  const fallbackComputed = useSignalOfState(fallback);

  return useComputedOnce(() =>
    eachComputed.value.length === 0
      ? fallbackComputed.value
      : eachComputed.value.map((value: GetValue<T>, index) => {
          const result = children(value, index);
          const key = keyExtractor
            ? keyExtractor(value, index)
            : (value as React.Key);
          if (__DEV__ && typeof key !== "string" && typeof key !== "number") {
            console.warn(
              keyExtractor
                ? `For: keyExtractor returned a non-string non-number key: ${key}`
                : `For: key is not a string or number: ${key}. Provide a keyExtractor prop to For to extract a key from the item.`
            );
          }
          if (!isValidElement(result)) {
            return createElement(Fragment, { key }, result);
          }
          return cloneElement(
            result,
            { ...result.props, key },
            result?.props?.children
          );
        })
  ).value as JSX.Element;
};

// if order is changed -> make full bail out

/**
 * @useSignals
 */
export const Index = <T extends Reactive<unknown[]>>(props: {
  each: T;
  fallback?: ReactNode;
  children: (item: GetArrItemValue<T>) => ReactNode;
}) => {
  const eachComputed = useSignalOfReactive(props.each);
  const length = useComputedOnce(() => eachComputed.value.length);
  const prevLength = useRef(length.peek());
  let sigs: Signal<T>[] = [];
  let prevKey: number[] = [];
  let currentItems: JSX.Element[] = [];

  untracked(() => {
    if (length.value !== currentItems.length) {
      if (length.value === 0) {
        sigs = [];
        prevKey = [];
        currentItems = [];
        return props.fallback;
      }
      const newItems = Array.from({ length: length.value });
      const prevKeysMap = new Map<Signal, number>()

      for (let i = 0; i < currentItems.length; ++i) {
        if (i < sigs.length && sigs[i]?.value === eachComputed.value[i]) {
          newItems[i] = currentItems[i];
        } else if (i < sigs.length) {
          sigs[i] = 
        }
      }
    }
  });
};

// const renderToNode =
//   <T,>(children: ForChildren<T>, keyExtractor: KeyExtractor<T>) =>
//   (_value: T) => {
//     const value = (isSignal(_value) ? _value : signal(_value)) as Signalify<T>;
//     console.log("before render");
//     const key = keyExtractor(getSignalValue(_value));
//     const renderResult = children(value);
//     const clonedNode = cloneElement(
//       renderResult,
//       { ...renderResult.props, key, children: undefined },
//       renderResult?.props?.children
//     );

//     return {
//       value,
//       key,
//       renderResult: clonedNode,
//     };
//   };
