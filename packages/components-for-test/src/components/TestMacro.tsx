import { signal } from "@preact/signals-react";
import { $$ } from "@preact-signals/utils/macro";

const a = signal(10);
const b = signal(20);

export const TestCounterMacro = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    <button onClick={() => a.value++}>Increment a: {a}</button>
    <button onClick={() => b.value++}>Increment b: {b}</button>
    <div>Total: {$$(a.value + b.value)}</div>
  </div>
);
