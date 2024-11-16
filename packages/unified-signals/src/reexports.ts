import * as signals from "@preact/signals-react";

const throwNotSupportedByPreactSignalsRuntime = (): never => {
  // @ts-expect-error i am too lazy to write types for this
  if (process.env.NODE_ENV === "development") {
    console.error(
      "preact signals runtime not implemented hooks, please use `@preact/signals-react` or `@preact/signals`",
    );
  }

  throw new Error("preact signals runtime not implemented hooks");
};

const { Signal, batch, computed, effect, signal, untracked } = signals;

export const useComputed =
  signals?.useComputed ?? throwNotSupportedByPreactSignalsRuntime;
export const useSignal =
  signals?.useSignal ?? throwNotSupportedByPreactSignalsRuntime;
export const useSignalEffect =
  signals?.useSignalEffect ?? throwNotSupportedByPreactSignalsRuntime;

export { Signal, batch, computed, effect, signal, untracked };
