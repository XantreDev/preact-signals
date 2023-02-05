import { SignalLike } from "./type";

export type ShowProps<T> = {
  when: SignalLike<T | undefined | null | false>;
  fallback?: JSX.Element;
  children: JSX.Element | ((item: T) => JSX.Element);
};

export const Show = <T,>({
  children,
  when: { value },
  fallback,
}: ShowProps<T>) => {
  if (!value) {
    return fallback ?? null;
  }

  return typeof children === "function" ? children(value) : children;
};
