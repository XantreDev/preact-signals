import { useRef } from "react";
import { SignalLike } from "./type";

export type ShowProps<T> = {
  when: SignalLike<T | undefined | null | false>;
  fallback?: JSX.Element;
  children: JSX.Element | ((item: SignalLike<T>) => JSX.Element);
};

export const Show = <T,>({ children, when, fallback }: ShowProps<T>) => {
  const childrenCache = useRef(
    typeof children === "function" ? null : children
  );

  if (!when.value) {
    return fallback ?? null;
  }

  if (childrenCache.current === null && typeof children === "function") {
    childrenCache.current = children(when as any);
  }
  return childrenCache.current as JSX.Element;
};
