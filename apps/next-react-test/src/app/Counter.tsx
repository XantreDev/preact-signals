"use strict";
"use client";
import { version } from "react";
import { useSignal } from "@preact-signals/safe-react";

console.log("react version", version);
const useCount = () => {
  const count = useSignal(0);

  console.log(count.value);
  return count;
};

export const Counter = () => {
  const count = useCount();
  return (
    <div>
      <h1>Counter</h1>
      <p>Current count: {count.value}</p>
      <button onClick={() => count.value++}>Increment</button>
    </div>
  );
};
