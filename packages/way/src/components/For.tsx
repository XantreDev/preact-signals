import { isSignal, Signalify } from "@/core";
import { signal, useSignalEffect } from "@preact/signals-react";
import { objectify } from "radash";
import { cloneElement, useRef, useState } from "react";
import { SignalLike } from "./type";

type KeyExtractor<T> = (item: T) => React.Key;

type ForNode<T> = {
  value: Signalify<T>;
  key: React.Key;
  renderResult: React.FunctionComponentElement<any>;
};

export type ForChildren<T> = (item: Signalify<T>) => JSX.Element;

export type ForProps<T> = {
  each: SignalLike<T[]>;
  fallback?: JSX.Element | SignalLike<JSX.Element>;
  keyExtractor: KeyExtractor<T>;
  children: ForChildren<T>;
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
  const firstEach = useRef<T[] | null>(each.peek());
  const [nodes, setNodes] = useState<ForNode<T>[]>(() =>
    each.peek().map(renderToNode(children, keyExtractor))
  );

  // if (process.env.NODE_ENV !== "production") {
  //   useDebugValue("hooks for hot reload");
  //   const prevChildren = useRef(children);
  //   const prevKeyExtractor = useRef(keyExtractor);

  //   useLayoutEffect(() => {
  //     if (
  //       prevChildren.current === children &&
  //       prevKeyExtractor.current === keyExtractor
  //     ) {
  //       return;
  //     }

  //     prevChildren.current = children;
  //     prevKeyExtractor.current = keyExtractor;
  //     setNodes(each.peek().map(renderToNode(children, keyExtractor)));
  //   }, [children, each, keyExtractor]);
  // }
  useSignalEffect(() => {
    const eachArray = each.value;

    if (firstEach.current === eachArray) {
      return;
    }
    firstEach.current = null;

    const map = objectify(nodes, (item) => item.key);
    const newState = eachArray.map((value) => {
      const key = keyExtractor(value);

      const currentNode = map[key];
      if (!currentNode) {
        return renderToNode(children, keyExtractor)(value);
      }
      if (!isSignal(value) && currentNode.value.peek() !== value) {
        currentNode.value.value = value;
      }
      return currentNode;
    });
    setNodes(newState);
  });

  return nodes.length === 0
    ? (fallback as JSX.Element)
    : (nodes.map((result) => result.renderResult) as unknown as JSX.Element);
};
const renderToNode =
  <T,>(children: ForChildren<T>, keyExtractor: KeyExtractor<T>) =>
  (_value: T) => {
    const value = (isSignal(_value) ? _value : signal(_value)) as Signalify<T>;
    const key = keyExtractor(value.peek());
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
