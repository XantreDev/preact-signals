import { Signal } from "@preact/signals-react";

export const isSignal = (value: unknown): value is Signal<any> =>
  value instanceof Signal;
