import { Signal } from "@preact-signals/unified-signals";
import { ReactiveFlags } from "./constants";

Object.defineProperty(Signal.prototype, ReactiveFlags.IS_SHALLOW, {
  configurable: true,
  value: true,
});
