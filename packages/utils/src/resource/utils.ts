import { NO_INIT } from "./constants";

/*@__NO_SIDE_EFFECTS__*/
export const isPromise = <T>(value: unknown): value is Promise<T> =>
  !!value && typeof value === "object" && value instanceof Promise;

/*@__NO_SIDE_EFFECTS__*/
export const removeNoInit = <T>(value: T | typeof NO_INIT) =>
  value !== NO_INIT ? value : undefined;
