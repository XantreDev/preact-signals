export type ExplicitFalsy = false | null | undefined;

export const isExplicitFalsy = (value: unknown): value is ExplicitFalsy =>
  value === false || value === null || value === undefined;
