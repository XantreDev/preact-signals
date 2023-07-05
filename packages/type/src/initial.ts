import { Signal } from "@preact/signals-core";
import { ReactNode } from "react";

type ExcludeKeys = "children" | "dangerouslySetInnerHTML" | "key" | "ref";

type SignalifyProps<Props> = {
  [K in keyof Props]: K extends ExcludeKeys
    ? Props[K]
    : Signal<Props[K]> | Props[K];
};

type Simplify<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T]: T[K];
    }
  : T;
type SignalifyComponent<T> = Simplify<T> & T extends (
  props?: infer Props | null,
  ...children: ReactNode[]
) => infer Result
  ? (
      props?: Simplify<SignalifyProps<Props>> | null,
      ...children: ReactNode[]
    ) => Result
  : never;
