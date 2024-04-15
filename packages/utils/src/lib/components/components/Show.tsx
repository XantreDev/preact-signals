import { ReactNode } from "react";
import {
  GetTruthyValue,
  Reactive,
  isExplicitFalsy,
  unwrapReactive,
} from "../../utils";
import { RenderResult } from "../type";

export type ShowProps<T extends Reactive<any>> = {
  when: T;
  fallback?: RenderResult;
  children: RenderResult | ((item: GetTruthyValue<T>) => RenderResult);
};

/**
 * @useSignals
 */
export const Show = <const T extends Reactive<any>>(
  props: ShowProps<T>
): ReactNode => {
  const when = unwrapReactive(props.when);
  const fallback = props.fallback ?? null;
  const children = props.children;

  return isExplicitFalsy(when)
    ? fallback
    : typeof children === "function"
      ? // @ts-expect-error reading value
        children(when)
      : children;
};
