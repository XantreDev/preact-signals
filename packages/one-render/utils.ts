import { Signal } from "@preact/signals-react";
import { mapValues, zip } from "radash";
import { RenderData } from "./globals";
import { AnyRecord } from "./hoc/types";

type Falsy = null | undefined | false | 0 | -0 | 0n | "";

/**
 * https://github.com/rayepps/radash/blob/7c6b986d19c68f19ccf5863d518eb19ec9aa4ab8/src/object.ts#L53
 * Map over all the keys to create a new object
 */
// export const mapValues = <
//   TValue,
//   TKey extends string | number | symbol,
//   TNewValue
// >(
//   obj: Record<TKey, TValue>,
//   mapFunc: (value: TValue, key: TKey) => TNewValue
// ): Record<TKey, TNewValue> => {
//   const keys = Object.keys(obj) as TKey[];
//   return keys.reduce((acc, key) => {
//     acc[key] = mapFunc(obj[key], key);
//     return acc;
//   }, {} as Record<TKey, TNewValue>);
// };

export const createGlobal = <T>(initialState: T) => {
  const ref = { current: initialState };

  const get = () => ref.current;
  const set = (newState: T) => {
    ref.current = newState;
  };

  return {
    get,
    set,
  };
};

export const createGlobalWithActions = <
  T,
  Actions extends Record<string, (state: T) => T>
>(
  initialState: T,
  actions: Actions
) => {
  const globalData = createGlobal(initialState);

  return {
    ...globalData,
    actions: mapValues(
      actions,
      (changer) => () => globalData.set(changer(globalData.get()))
    ) as Record<keyof Actions, () => void>,
  };
};

export const unwrap = <T>(value: T | Nil, message?: string): T => {
  if (value === undefined || value === null) throw new Error(message);

  return value;
};

type Nil = null | undefined;
type HooksWithReturnTupleOfTwoArgs =
  | "useState"
  | "useReducer"
  | "useTransition";

export const hookEqualityChecker = (prev: unknown, current: unknown) => {
  if (prev === current) return true;
  if (
    Array.isArray(prev) &&
    prev?.length === 2 &&
    Array.isArray(current) &&
    prev?.length === 2
  ) {
    return zip(prev, current).every(
      ([prevItem, currentItem]) => prevItem === currentItem
    );
  }

  return false;
};
export const initRenderData = (): RenderData => ({
  events: [],
  renderResult: null,
});

export const createObject = <T extends AnyRecord>() => Object.create(null) as T;

export const isSignal = (value: unknown): value is Signal<any> =>
  value instanceof Signal;
