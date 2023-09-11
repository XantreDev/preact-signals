import { untracked } from "@preact-signals/utils";

export const EMPTY_OBJECT = {} as const;
export const EMPTY_ARRAY = [] as const;

const wrapHandler: ProxyHandler<Function> = {
  apply(target, thisArg, args) {
    return untracked(() => target.apply(thisArg, args));
  },
};

export const wrapWithUntracked = /** __PURE__ */ <T extends Function>(
  fn: T
): T => new Proxy(fn, wrapHandler) as T;

export const wrapFunctionsInUntracked = /** __PURE__ */ <
  T extends Record<any, any>
>(
  obj: T
): T => {
  for (const key in obj) {
    if (typeof obj[key] === "function") {
      obj[key] = wrapWithUntracked(obj[key]);
    }
  }
  return obj;
};
