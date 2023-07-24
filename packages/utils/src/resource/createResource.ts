import { Accessor, AnyReactive } from "@preact-signals/internal-utils";
import {
  ResourceActions,
  ResourceOptions,
  ResourceState,
  resource,
} from "./resource";

export type CreateResourceReturn<
  TResult,
  TRefreshing = unknown
  // TSuspense extends boolean = false
> = [
  ResourceState<TResult>,
  ResourceActions<TResult | undefined, TRefreshing> & {
    /** @internal */ dispose: () => void;
  }
];
/**
 * Creates a resource that wraps a repeated promise in a reactive pattern:
 * ```typescript
 * // Without source
 * const [resource, { mutate, refetch }] = createResource({
 *  fetcher: () => fetch("https://swapi.dev/api/people/1").then((r) => r.json()),
 * });
 * // With source
 * const [resource, { mutate, refetch }] = createResource({
 *   source: () => userId.value,
 *   fetcher: (userId) => fetch(`https://swapi.dev/api/people/${userId}`).then((r) => r.json()),
 * });
 * ```
 * @param options - Contains all options for creating resource
 *
 * @returns ```typescript
 * [ResourceState<TResult>, { mutate: Setter<T>, refetch: () => void }]
 * ```
 *
 * * Setting an `initialValue` in the options will mean that resource will be created in `ready` state
 * * `mutate` allows to manually overwrite the resource without calling the fetcher
 * * `refetch` will re-run the fetcher without changing the source, and if called with a value, that value will be passed to the fetcher via the `refetching` property on the fetcher's second parameter
 *
 */
export function createResource<
  TResult,
  TSource extends AnyReactive = Accessor<true>,
  TRefreshing = boolean
>(
  options: ResourceOptions<TResult, TSource, TRefreshing>
): CreateResourceReturn<TResult, TRefreshing> {
  const result = resource(options);
  return [
    result,
    {
      mutate: result.mutate,
      refetch: result.refetch,
      dispose: result.dispose,
    },
  ];
}
