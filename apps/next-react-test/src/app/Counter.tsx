"use strict";
"use client";

import { useSignal } from "@preact-signals/safe-react";

export const Counter = () => {
  const count = useSignal(0);
  return (
    <div>
      <h1>Counter</h1>
      <p>Current count: {count.value}</p>
      <button onClick={() => count.value++}>Increment</button>
    </div>
  );
};
