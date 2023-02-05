import { useSignalEffect } from "@preact/signals-react";
import { objectify } from "radash";
import { cloneElement, useRef, useState } from "react";
import { SignalLike } from "./type";

type KeyExtractor<T> = (item: T) => React.Key;

type ForNode<T> = {
  value: T;
  key: React.Key;
  renderResult: React.FunctionComponentElement<any>;
};

export type ForProps<T> = {
  each: SignalLike<T[]>;
  fallback?: JSX.Element | SignalLike<JSX.Element>;
  keyExtractor: KeyExtractor<T>;
  children: (item: T) => JSX.Element;
};

/**
 * @description Sorry for key extractors, I think Solid mapArray can be adopted
 * this should be used for reactive lists, but for constant lists just map can be used
 */
export const For = <T,>({
  children,
  each,
  fallback,
  keyExtractor,
}: ForProps<T>): JSX.Element => {
  // not memory leak but unnecessary memory hold
  const firstEach = useRef<T[] | null>(each.peek());
  const [nodes, setNodes] = useState<ForNode<T>[]>(() =>
    each.peek().map(renderToNode(children, keyExtractor))
  );

  useSignalEffect(() => {
    const eachArray = each.value;

    if (firstEach.current === eachArray) {
      return;
    }

    const map = objectify(nodes, (item) => item.key);
    const newState = eachArray.map((value) => {
      const key = keyExtractor(value);

      const currentNode = map[key];
      if (currentNode) {
        return currentNode;
      }
      return renderToNode(children, keyExtractor)(value);
    });
    setNodes(newState);
  });

  return nodes.length === 0
    ? (fallback as JSX.Element)
    : (nodes.map((result) => result.renderResult) as unknown as JSX.Element);
};
const renderToNode =
  <T,>(children: (item: T) => JSX.Element, keyExtractor: KeyExtractor<T>) =>
  (value: T) => {
    const key = keyExtractor(value);
    const renderResult = children(value);
    const clonedNode = cloneElement(
      renderResult,
      { ...renderResult.props, key, children: undefined },
      renderResult?.props?.children
    );

    return {
      value,
      key,
      renderResult: clonedNode,
    };
  };
