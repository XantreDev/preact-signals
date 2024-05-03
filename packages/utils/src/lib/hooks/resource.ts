import { useEffect, useRef } from "react";
import {
  CreateResourceReturn,
  ResourceOptions,
  createResource,
} from "../resource";
import { Accessor, AnyReactive } from "../utils";
import { EMPTY_ARRAY } from "../constants";

/**
 * See {@link createResource}
 * @param options resource are created once, so only first options matter
 * @returns
 */
export const useResource = <
  TResult,
  TSource extends AnyReactive = Accessor<true>,
  TRefreshing = boolean,
>(
  options: ResourceOptions<TResult, TSource, TRefreshing>
): CreateResourceReturn<TResult, TRefreshing> => {
  const r = useRef<null | CreateResourceReturn<TResult, TRefreshing>>(null);

  if (r.current === null) {
    r.current = createResource(options);
  }
  // activate on mount
  // @ts-expect-error returns beautiful type
  useEffect(() => r.current![0]!.activate(), EMPTY_ARRAY);

  return r.current!;
};
