import type { GetValue, Reactive } from "@preact-signals/internal-utils";
import { Fragment, cloneElement, createElement, isValidElement } from "react";
import {
  useComputedOnce,
  useSignalOfReactive,
  useSignalOfState,
} from "../../hooks";
import { RenderResult } from "../type";

type GetArrItemValue<T extends Reactive<any[]>> = GetValue<T>[number];

export type KeyExtractor<T> = (item: T, index: number) => React.Key;
export type ForProps<T extends Reactive<any[]>> = {
  each: T;
  fallback?: RenderResult;
  children: (accessor: GetArrItemValue<T>, index: number) => RenderResult;
} & (GetArrItemValue<T> extends React.Key
  ? { keyExtractor?: KeyExtractor<GetArrItemValue<T>> }
  : { keyExtractor: KeyExtractor<GetArrItemValue<T>> });

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
          if (process.env.NODE_ENV === "development") {
            if (typeof key !== "string" || typeof key !== "number") {
              console.warn(
                keyExtractor
                  ? `For: keyExtractor returned a non-string non-number key: ${key}`
                  : `For: key is not a string or number: ${key}. Provide a keyExtractor prop to For to extract a key from the item.`
              );
            }
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
