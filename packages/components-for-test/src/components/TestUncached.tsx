import { $ } from "@preact-signals/utils";
import { useSignal } from "@preact/signals-react";

export const TextUncachedJSXBindings = (): JSX.Element => {
  const counter = useSignal(0);

  return (
    <div>
      <h1>TextUncachedJSXBindings</h1>
      <div>Doubled counter: {$(() => counter.value * 2)}</div>
      <button onClick={() => (counter.value += 1)}>Increment</button>
    </div>
  );
};
