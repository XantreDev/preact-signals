import { untracked } from "@preact-signals/unified-signals";
import { useMemo } from "react";
import { EMPTY_ARRAY } from "../constants";
import { deepSignal, Store } from "../store";

export const useDeepSignal = <T>(creator: () => T) =>
  useMemo(() => deepSignal(untracked(creator)), EMPTY_ARRAY);

export const useDeepReactive = <T extends object>(creator: () => T) =>
  useMemo(() => Store.deepReactive(untracked(creator)), EMPTY_ARRAY);

export const useShallowReactive = <T extends object>(creator: () => T) =>
  useMemo(() => Store.shallowReactive(untracked(creator)), EMPTY_ARRAY);
