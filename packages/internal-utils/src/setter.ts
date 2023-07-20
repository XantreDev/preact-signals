import { Signal } from "@preact/signals-core";
import { Setter } from "./type";

function setter<T>(this: Signal<T>, value: Setter<T>) {
  const currentValue = this.peek();

  // @ts-expect-error unions
  const newValue = typeof value === "function" ? value(currentValue) : value;

  this.value = newValue;

  return newValue;
}

export const setterOfSignal = <T>(signal: Signal<T>): Setter<T> =>
  setter.bind(signal) as Setter<T>;

export const toggleSignal = (sig: Signal<boolean>) => {
  sig.value = !sig.peek();
};
