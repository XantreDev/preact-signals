import * as signals from "@preact/signals-react";

const throwNotSupportedByPreactSignalsRuntime = (): never => {
  // @ts-expect-error i am too lazy to write types for this
  if (process.env.NODE_ENV === "development") {
    console.error(
      "preact signals runtime not implemented hooks, please use `@preact/signals-react` or `@preact/signals`"
    );
  }

  throw new Error("preact signals runtime not implemented hooks");
};

const {
  Signal,
  batch,
  computed,
  effect,
  signal,
  useComputed = throwNotSupportedByPreactSignalsRuntime,
  useSignal = throwNotSupportedByPreactSignalsRuntime,
  useSignalEffect = throwNotSupportedByPreactSignalsRuntime,
} = signals;

export {
  Signal,
  batch,
  computed,
  effect,
  signal,
  useComputed,
  useSignal,
  useSignalEffect
};

