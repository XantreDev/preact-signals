import React, { Children, isValidElement } from "react";
import {
  Accessor,
  AnyReactive,
  GetTruthyValue,
  Reactive,
  accessorOfReactive,
  isExplicitFalsy,
  unwrapReactive,
} from "../../utils";
import { RenderResult } from "../type";

export type MatchProps<T extends AnyReactive> = {
  when: T;
  /**
   * shouldn't change during the lifecycle of the component
   */
  children:
    | RenderResult
    | ((item: Accessor<GetTruthyValue<T>>) => RenderResult);
};

const matchSymbol = Symbol("match");
const Match = Object.assign(
  <const T extends AnyReactive>(_props: MatchProps<T>) => null,
  {
    [matchSymbol]: true,
  }
);

export { Match };

export type SwitchProps = {
  /**
   * shouldn't change during the lifecycle of the component
   */
  fallback?: RenderResult;
  /**
   * shouldn't change during the lifecycle of the component
   */
  children: JSX.Element | JSX.Element[];
};

/**
 *
 * @useSignals
 */
const Switch_ = (props: SwitchProps): JSX.Element => {
  if (
    __DEV__ &&
    !Children.toArray(props.children).every(
      (item) =>
        item &&
        isValidElement(item) &&
        "when" in item.props &&
        "children" in item.props &&
        // @ts-expect-error we are not sure it here
        item.type[matchSymbol]
    )
  ) {
    throw new Error(
      "every child of switch should be Match and have when and children props"
    );
  }
  const childrenArray = Children.toArray(props.children) as {
    props: MatchProps<Reactive<unknown>>;
  }[];

  const fallback = props.fallback ?? null;

  if (__DEV__ && childrenArray.length === 0) {
    console.warn("Switch component has no children");
  }

  const itemIndex = childrenArray.findIndex(
    ({ props: item }) => !isExplicitFalsy(unwrapReactive(item.when))
  );

  if (itemIndex === -1) {
    return fallback as JSX.Element;
  }
  const item = childrenArray[itemIndex]?.props;
  if (!item) {
    throw new Error("item is not found");
  }
  const children = item.children;

  return (
    typeof children === "function"
      ? children(accessorOfReactive(item.when))
      : children
  ) as JSX.Element;
};

/**
 *
 * @example
 * // when prop can be callback or signal
 * <Switch>
 *  <Switch.Match when={() => isLoading.value}>
 *    <Loader />
 *  </Switch.Match>
 *  <Switch.Match when={() => isError.value}>
 *    There are an error
 *  </Switch.Match>
 *  <Switch.Match when={() => data.value}>
 *    {(contentAccessor) => (
 *      contentAccessor().id === 10 ? 1 : 2
 *    )}
 *  </Switch.Match>
 * </Switch>
 *
 * @description only static `Match` components are allowed. Here how you **cannot** use it:
 * @example
 * <Switch>
 *  {a > 10 ? <Switch.Match when={() => isLoading.value}>
 *    <Loader />
 *  </Switch.Match>
 *  : <Switch.Match when={() => isError.value}>
 *    There are an error
 *  </Switch.Match>}
 * </Switch>
 */
export const Switch = Object.assign(Switch_, {
  Match,
});
