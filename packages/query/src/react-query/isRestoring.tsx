"use client";
import { useSignalContext } from "@preact-signals/utils/hooks";
import { ReadonlySignal } from "@preact/signals-react";
import * as React from "react";

const IsRestoringContext = React.createContext(false);

export const useIsRestoring$ = (): ReadonlySignal<boolean> =>
  useSignalContext(IsRestoringContext);
export const useIsRestoring = () => React.useContext(IsRestoringContext);
export const IsRestoringProvider = IsRestoringContext.Provider;
