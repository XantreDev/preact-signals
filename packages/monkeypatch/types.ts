import type * as React from "react";

type PickHooks<T extends Record<string, unknown>> = {
  [Key in keyof T as Key extends `use${string}` ? Key : never]: T[Key];
};

export type HookName = keyof PickHooks<typeof React>;
