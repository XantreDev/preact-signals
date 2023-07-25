import type { GetValue, Reactive } from "@preact-signals/internal-utils";
import { RenderResult } from "../type";

export type KeyExtractor<T> = (item: T, index: number) => React.Key;
export type ForProps<T extends Reactive<any[]>> = {
  each: Reactive<T[]>;
  fallback?: RenderResult;
  children: (accessor: GetValue<T>, index: number) => RenderResult;
} & GetValue<T>[number] extends object
  ? { keyExtractor: KeyExtractor<GetValue<T>> }
  : { keyExtractor?: KeyExtractor<GetValue<T>> };

// export const For = <T extends Reactive<any[]>>({
//   children,
//   each,
//   fallback,
//   keyExtractor,
// }: ForProps<T>): JSX.Element => {
//   const eachComputed = useComputedOfReactive(each);

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
