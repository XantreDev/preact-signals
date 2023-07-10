import { Accessor, AnyReactive } from "@preact-signals/utils";
import { useEffect, useRef } from "react";
import { CreateResourceReturn, createResource } from "./createResource";
import { ResourceOptions } from "./resource";

/**
 *
 * @param options resource are created once, so only first options matter
 * @returns
 */
export const useResource = <
  TResult,
  TSource extends AnyReactive = Accessor<true>,
  TRefreshing = boolean
>(
  options: ResourceOptions<TResult, TSource, TRefreshing>
): CreateResourceReturn<TResult, TRefreshing> => {
  const r = useRef<null | CreateResourceReturn<TResult, TRefreshing>>(null);

  if (r.current === null) {
    r.current = createResource(options);
  }
  useEffect(() => () => r.current![1]!.dispose(), []);
  return r.current!;
};
