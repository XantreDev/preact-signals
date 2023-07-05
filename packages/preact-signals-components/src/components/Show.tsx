import { ReadonlySignal } from "@preact/signals-react";
import { AccessorOrSignal, GetTruthyValue, RenderResult } from "../type";
import {
  useComputed,
  useComputedOfAccessorOrSignal,
  useSignalOf,
} from "../utils";

export type ShowProps<T extends AccessorOrSignal<any>> = {
  when: T;
  fallback?: RenderResult;
  children: JSX.Element | ((item: GetTruthyValue<T>) => RenderResult);
};

declare var process: {
  env: {
    NODE_ENV?: "production" | "development";
  };
};
export const Show = <const T extends AccessorOrSignal<any>>(
  props: ShowProps<T>
): ReadonlySignal<RenderResult> => {
  const when = useComputedOfAccessorOrSignal(props.when);
  const fallback = useSignalOf(props.fallback ?? null);
  const children = useSignalOf(props.children);

  return useComputed(() =>
    when.value
      ? typeof children.value === "function"
        ? children.value(when.value)
        : children.value
      : fallback.value
  );
};
