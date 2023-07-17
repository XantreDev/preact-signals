import { useComputedOnce, useSignalOfState } from "@preact-signals/hooks";
import {
  Accessor,
  AnyReactive,
  GetTruthyValue,
  Reactive,
  accessorOfReactive,
  isExplicitFalsy,
  unwrapReactive,
} from "@preact-signals/utils";
import { isValidElement } from "react";
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
export const Match = Object.assign(
  <const T extends AnyReactive>(_props: MatchProps<T>) => null,
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
export const Switch = (props: SwitchProps): JSX.Element => {
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
  const matches = useSignalOfState(
    props.children as { props: MatchProps<Reactive<unknown>> }[]
  );
  const fallback = useSignalOfState<RenderResult>(props.fallback ?? null);

  return useComputedOnce(() => {
    if (matches.value.length === 0) {
      return fallback.value ?? null;
    }
    const item = matches.value.find(
      (item) => !isExplicitFalsy(unwrapReactive(item.props.when))
    );
    if (!item) {
      return fallback.value ?? null;
    }
    return typeof item.props.children === "function"
      ? item.props.children(accessorOfReactive(item.props.when))
      : item.props.children;
  }).value as JSX.Element;
};
