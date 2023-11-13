import { untracked } from "@preact-signals/unified-signals";
import { useMemo } from "react";
import { EMPTY_ARRAY } from "../constants";
import { deepSignal } from "../store";
import { deepReactive, shallowReactive } from "./reactivity";

export const useDeepSignal = <T>(creator: () => T) =>
  useMemo(() => deepSignal(untracked(creator)), EMPTY_ARRAY);

export const useDeepReactive = <T extends object>(creator: () => T) =>
  useMemo(() => deepReactive(untracked(creator)), EMPTY_ARRAY);

export const useShallowReactive = <T extends object>(creator: () => T) =>
  useMemo(() => shallowReactive(untracked(creator)), EMPTY_ARRAY);
