import { useComputed } from "@preact/signals-react";
import { SignalLike } from "./type";

type Match<T> = {
  when: SignalLike<T | undefined | null | false>;
  render: JSX.Element | ((item: T) => JSX.Element);
};

// TODO: can be different types
type Matches<T> = Match<T>[];

export const createMatches = <T,>(...matches: Matches<T>) => matches;

export type SwitchProps = {
  fallback?: JSX.Element;
  children: Matches<unknown>;
};

export const Switch = ({ children, fallback }: SwitchProps) =>
  useComputed(() => {
    const item = children.find((item) => item.when.value);
    if (!item) {
      return fallback ?? null;
    }

    return typeof item.render === "function"
      ? item.render(item.when.peek())
      : item;
  }) as unknown as JSX.Element;
