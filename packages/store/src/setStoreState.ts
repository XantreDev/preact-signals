export const createStoreSetter =
  <T extends Record<string | number, any>>(store: T) =>
  (newValue: Partial<T>) => {
    for (const key in newValue) {
      // @ts-expect-error
      store[key] = newValue[key];
    }
  };
