import { Signal } from "@preact/signals-react";

export const Counter = ({ counter }: { counter: Signal<number> }) => (
  <>
    <button onClick={() => counter.value++}>+</button>
    <span>{counter}</span>
  </>
);
