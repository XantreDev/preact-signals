"use client";
import { useSignalContext } from "@preact-signals/hooks";
import { ReadonlySignal } from "@preact/signals-core";
import * as React from "react";

const IsRestoringContext = React.createContext(false);

export const useIsRestoring$ = (): ReadonlySignal<boolean> =>
  useSignalContext(IsRestoringContext);
export const useIsRestoring = () => React.useContext(IsRestoringContext);
export const IsRestoringProvider = IsRestoringContext.Provider;
