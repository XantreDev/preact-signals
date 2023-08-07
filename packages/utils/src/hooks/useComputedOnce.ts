import { ReadonlySignal, computed } from "@preact-signals/unified-signals";
import { useRef } from "react";

/**
 *
 * @param compute applies only once - on first render, to make function on rerender have short live and be GC-ed with Minor GC. First function can be easily JIT-ed
 * @returns static reference computed
 */
export const useComputedOnce = <T>(compute: () => T) => {
  const c = useRef<null | ReadonlySignal<T>>(null);
  if (c.current === null) {
    c.current = computed(compute);
  }

  return c.current!;
};
