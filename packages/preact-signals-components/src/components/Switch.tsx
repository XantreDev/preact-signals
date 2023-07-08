import { ReadonlySignal } from "@preact/signals-react";
import { isValidElement } from "react";
import {
  Accessor,
  AccessorOrSignal,
  AnyAccessorOrSignal,
  GetTruthyValue,
  RenderResult,
  isExplicitFalsy,
} from "../type";
import { toAccessor, toValue, useComputed, useSignalOf } from "../utils";

export type MatchProps<T extends AnyAccessorOrSignal> = {
  when: T;
  /**
   * shouldn't change during the lifecycle of the component
   */
  children:
    | RenderResult
    | ((item: Accessor<GetTruthyValue<T>>) => RenderResult);
};

const matchSymbol = Symbol("match");
export const Match = Object.assign(
  <const T extends AnyAccessorOrSignal>(_props: MatchProps<T>) => null,
  {
    [matchSymbol]: true,
  }
);

export type SwitchProps = {
  /**
   * shouldn't change during the lifecycle of the component
   */
  fallback?: JSX.Element;
  /**
   * shouldn't change during the lifecycle of the component
   */
  children: JSX.Element[];
};

declare var process: {
  env: {
    NODE_ENV?: "production" | "development";
  };
};

/**
 * @example 
 * // when prop can be callback or signal
 * <Switch>
 *  <Match when={() => isLoading.value}>
 *    <Loader />
 *  </Match>
 *  <Match when={() => isError.value}>
 *    There are an error
 *  </Match>
 *  <Match when={() => data.value}>
 *    {(contentAccessor) => (
 *      contentAccessor().id === 10 ? 1 : 2
 *    )}
 *  </Match>
 * </Switch>
 */
export const Switch = (props: SwitchProps): ReadonlySignal<RenderResult> => {
  if (
    process.env.NODE_ENV === "development" &&
    !props.children.every(
      (item) =>
        "when" in item.props &&
        "children" in item.props &&
        item.type[matchSymbol] &&
        isValidElement(item)
    )
  ) {
    throw new Error(
      "every child of switch should be Match and have when and children props"
    );
  }
  const matches = useSignalOf(
    props.children as { props: MatchProps<AccessorOrSignal<unknown>> }[]
  );
  const fallback = useSignalOf<RenderResult>(props.fallback ?? null);

  return useComputed(() => {
    if (matches.value.length === 0) {
      return fallback.value ?? null;
    }
    const item = matches.value.find((item) => !isExplicitFalsy(toValue(item.props.when)));
    if (!item) {
      return fallback.value ?? null;
    }
    return typeof item.props.children === "function"
      ? item.props.children(toAccessor(item.props.when))
      : item.props.children;
  });
};
