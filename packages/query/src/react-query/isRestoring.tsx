"use client";
import { useSignalContext } from "@preact-signals/hooks";
import * as React from "react";

const IsRestoringContext = React.createContext(false);

export const useIsRestoring$ = () => useSignalContext(IsRestoringContext);
export const useIsRestoring = () => React.useContext(IsRestoringContext);
export const IsRestoringProvider = IsRestoringContext.Provider;
