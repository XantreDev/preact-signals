// import { useComputed } from "@preact/signals-react";
// import {
//   AccessorOrSignal,
//   GetValue,
//   RenderResult
// } from "../type";
// import { useComputedOfAccessorOrSignal } from "../utils";

// export type KeyExtractor<T> = (item: T, index: number) => string | number;
// export type ForProps<T extends AccessorOrSignal<any[]>> = {
//   each: AccessorOrSignal<T[]>;
//   fallback?: RenderResult;
//   keyExtractor: KeyExtractor<GetValue<T>>;
//   children: (accessor: GetValue<T>, index: number) => RenderResult;
// };

// export const For = <T extends AccessorOrSignal<any[]>>({
//   children,
//   each,
//   fallback,
//   keyExtractor,
// }: ForProps<T>): JSX.Element => {
//   const eachComputed = useComputedOfAccessorOrSignal(each);

//   return useComputed(() => {
//     eachComputed.value.length === 0
//       ? fallback
//       : (each.value.map((value) => ch) as unknown as JSX.Element);
//   });
// };

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
