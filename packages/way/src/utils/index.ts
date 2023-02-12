import { mapValues, zip } from "radash";

type AnyRecord = Record<any, any>;

type Falsy = null | undefined | false | 0 | -0 | 0n | "";

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

type Nil = null | undefined;
export const unwrap = <T>(value: T | Nil, message?: string): T => {
  if (value === undefined || value === null) throw new Error(message);

  return value;
};
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

export const createObject = <T extends AnyRecord>() => Object.create(null) as T;
