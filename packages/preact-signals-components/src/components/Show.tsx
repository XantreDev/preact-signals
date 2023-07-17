import {
  useComputedOnce,
  useSignalOfReactive,
  useSignalOfState,
} from "@preact-signals/hooks";
import {
  GetTruthyValue,
  Reactive,
  isExplicitFalsy,
} from "@preact-signals/utils";
import { RenderResult } from "../type";

export type ShowProps<T extends Reactive<any>> = {
  when: T;
  fallback?: RenderResult;
  children: RenderResult | ((item: GetTruthyValue<T>) => RenderResult);
};

export const Show = <const T extends Reactive<any>>(
  props: ShowProps<T>
): JSX.Element => {
  const when = useSignalOfReactive(props.when);
  const fallback = useSignalOfState(props.fallback ?? null);
  const children = useSignalOfState(props.children);

  return useComputedOnce(() =>
    isExplicitFalsy(when.value)
      ? typeof children.value === "function"
        ? children.value(when.value)
        : children.value
      : fallback.value
  ).value as JSX.Element;
};
