import { useComputed } from "@preact/signals-react";
import { Children, isValidElement, ReactElement } from "react";
import { SignalLike } from "./type";

export type MatchProps<T> = {
  when: SignalLike<T | undefined | null | false>;
  children: JSX.Element | ((item: SignalLike<T>) => JSX.Element);
};

export const Match = <T,>(props: MatchProps<T>) => null;

export type SwitchProps = {
  fallback?: JSX.Element;
  children: JSX.Element;
};

export const Switch = ({ children, fallback }: SwitchProps) => {
  const childrenArray = Children.toArray(children);
  if (
    !childrenArray.every(
      (item) => isValidElement(item) && item.props?.when && item.props?.render
    )
  ) {
    throw new Error("every child of switch should be Match");
  }
  const matches = (childrenArray as ReactElement[]).map(
    (item) => item.props as MatchProps<any>
  );

  return useComputed(() => {
    const item = matches.find((item) => item.when.value);
    if (!item) {
      return fallback ?? null;
    }

    return typeof item.children === "function"
      ? item.children(item.when)
      : item.children;
  }) as unknown as JSX.Element;
};
