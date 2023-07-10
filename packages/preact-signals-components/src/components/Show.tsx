import {
  useComputedOnce,
  useSignalOfReactive,
  useSignalOfState,
} from "@preact-signals/hooks";
import { GetTruthyValue, Reactive } from "@preact-signals/utils";
import { ReadonlySignal } from "@preact/signals-react";
import { RenderResult } from "../type";

export type ShowProps<T extends Reactive<any>> = {
  when: T;
  fallback?: RenderResult;
  children: JSX.Element | ((item: GetTruthyValue<T>) => RenderResult);
};

export const Show = <const T extends Reactive<any>>(
  props: ShowProps<T>
): ReadonlySignal<RenderResult> => {
  const when = useSignalOfReactive(props.when);
  const fallback = useSignalOfState(props.fallback ?? null);
  const children = useSignalOfState(props.children);

  return useComputedOnce(() =>
    when.value
      ? typeof children.value === "function"
        ? children.value(when.value)
        : children.value
      : fallback.value
  ) as ReadonlySignal<RenderResult>;
};
