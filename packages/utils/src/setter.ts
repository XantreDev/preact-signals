import { Signal } from "@preact/signals-core";
import { Setter } from "./type";

export const setterOfSignal =
  <T>(signal: Signal<T>): Setter<T> =>
  (value) => {
    const currentValue = signal.peek();

    // @ts-expect-error unions
    const newValue = typeof value === "function" ? value(currentValue) : value;

    signal.value = newValue;

    return newValue;
  };
