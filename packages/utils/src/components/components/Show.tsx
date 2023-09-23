import {
  useComputedOnce,
  useSignalOfReactive,
  useSignalOfState,
} from "../../hooks";
import { GetTruthyValue, Reactive, isExplicitFalsy } from "../../utils";
import { RenderResult } from "../type";

export type ShowProps<T extends Reactive<any>> = {
  when: T;
  fallback?: RenderResult;
  children: RenderResult | ((item: GetTruthyValue<T>) => RenderResult);
};

/**
 * @trackSignals
 */
export const Show = <const T extends Reactive<any>>(
  props: ShowProps<T>
): JSX.Element => {
  const when = useSignalOfReactive(props.when);
  const fallback = useSignalOfState(props.fallback ?? null);
  const children = useSignalOfState(props.children);

  return useComputedOnce(() =>
    isExplicitFalsy(when.value)
      ? fallback.value
      : typeof children.value === "function"
      ? // @ts-expect-error reading value
        children.value(when.value)
      : children.value
  ).value as JSX.Element;
};
