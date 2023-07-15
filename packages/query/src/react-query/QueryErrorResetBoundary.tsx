"use client";
import { useSignalContext } from "@preact-signals/hooks";
import { ReadonlySignal } from "@preact/signals-core";
import * as React from "react";

// CONTEXT

export interface QueryErrorResetBoundaryValue {
  clearReset: () => void;
  isReset: () => boolean;
  reset: () => void;
}

function createValue(): QueryErrorResetBoundaryValue {
  let isReset = false;
  return {
    clearReset: () => {
      isReset = false;
    },
    reset: () => {
      isReset = true;
    },
    isReset: () => {
      return isReset;
    },
  };
}

const QueryErrorResetBoundaryContext = React.createContext(createValue());

// HOOK

export const useQueryErrorResetBoundary$ =
  (): ReadonlySignal<QueryErrorResetBoundaryValue> =>
    useSignalContext(QueryErrorResetBoundaryContext);
export const useQueryErrorResetBoundary = () =>
  React.useContext(QueryErrorResetBoundaryContext);

// COMPONENT

export interface QueryErrorResetBoundaryProps {
  children:
    | ((value: QueryErrorResetBoundaryValue) => React.ReactNode)
    | React.ReactNode;
}

export const QueryErrorResetBoundary = ({
  children,
}: QueryErrorResetBoundaryProps): JSX.Element => {
  const [value] = React.useState(() => createValue());
  return (
    <QueryErrorResetBoundaryContext.Provider value={value}>
      {typeof children === "function"
        ? (children as Function)(value)
        : children}
    </QueryErrorResetBoundaryContext.Provider>
  );
};
