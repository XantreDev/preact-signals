import "vitest";

interface Matchers<R> {
  toHaveBeenWarned(): R;
  toHaveBeenWarnedLast(): R;
  toHaveBeenWarnedTimes(n: number): R;
}

declare module "vitest" {
  interface Assertion<T = any> extends Matchers<T> {}
}
