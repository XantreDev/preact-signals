import { hookScope, withOneRender } from "@/core";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";

export const SimpleHooks = withOneRender(() => {
  console.log("one render");
  hookScope(() => {
    console.log("empty hook scope");
  });
  hookScope(() => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      const interval = setInterval(
        () => setCount((currentCount) => currentCount + 1),
        1_000
      );

      return () => clearInterval(interval);
    }, []);
    const double = useMemo(() => count * 2, [count]);
    console.log({ count, double });
  });
  hookScope(() => {
    const [count2, setCount] = useState(0);
    useLayoutEffect(() => {
      setCount(10);
      // const interval = setInterval(
      //   () => setCount((currentCount) => currentCount + 1),
      //   2_000
      // );

      // return () => clearInterval(interval);
    }, []);

    console.log({ count2 });
  });

  return null;
});
